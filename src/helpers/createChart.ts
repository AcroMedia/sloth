import fs from 'fs';
import { JSDOM } from 'jsdom';
import * as d3 from 'd3';

/**
 * Output memory usage data to SVG line graph
 */
export default (data: Array<Array<number>>, path: string): void => {
  const dom = new JSDOM('<html><body></body></html>');
  const margin = {
    top: 20, right: 20, bottom: 30, left: 60,
  };
  const w = 900 - margin.left - margin.right;
  const h = 500 - margin.top - margin.bottom;

  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> = d3.select(dom.window.document).select('body')
    .append('svg')
    .attr('width', w + margin.left + margin.right)
    .attr('height', h + margin.top + margin.bottom);

  // Background cheat
  svg.append('rect')
    .attr('fill', 'white')
    .attr('width', '100%')
    .attr('height', '100%');

  // @ts-expect-error d3 is bound to get mad, there are like 3 different SVG types
  svg = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Data mapping
  const chartData: { x: number, y: number }[][] = data.map(
    (d: Array<number>) => d.map(
      (val: number, i) => ({
        x: i,
        y: val,
      }),
    ),
  );

  // Get the largest of the two arrays so we can scale the graph properly
  const largest: { x: number, y: number }[] = chartData.sort(
    (a: { x: number, y: number }[], b: { x: number, y: number }[]) => a.length - b.length,
  )[0];

  // Dimension functions, used for data scaling
  const x: d3.ScaleLinear<number, number> = d3.scaleLinear().range([0, w]);
  const y: d3.ScaleLinear<number, number> = d3.scaleLinear().range([h, 0]);

  // Use scaling functions from before to create a new line creating function
  // eslint-disable-next-line @typescript-eslint/ban-types
  const lineFunc: Function = d3.line()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .x((d: any) => x(d.x))
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .y((d: any) => y(d.y))
    .curve(d3.curveLinear);

  // @ts-expect-error Domain isn't supposed to be a function that takes params?
  x.domain(d3.extent(largest, (d) => d.x));
  // @ts-expect-error Same domain issue.
  y.domain([0, d3.max(largest, (d) => d.y)]);

  // First path
  svg.append('svg:path')
    .attr('d', lineFunc(chartData[0]))
    .attr('stroke', 'blue')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  // Second (shorter if not the same) path
  svg.append('svg:path')
    .attr('d', lineFunc(chartData[1]))
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  // X axis
  svg.append('g')
    .attr('transform', `translate(0, ${h})`)
    .call(d3.axisBottom(x));

  // Y axis
  svg.append('g')
    .call(d3.axisLeft(y));

  fs.writeFileSync(path, dom.window.document.body.innerHTML);
};
