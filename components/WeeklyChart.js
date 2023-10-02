import React from "react";
import { View, Dimensions } from "react-native";
import { Svg, Path, G, Text, Line, Circle } from "react-native-svg";
import * as d3 from "d3";
import data from "./data.json";

const now = new Date();
const day = now.getDay();

const zoneData = data.heart_chart_cumulative_format2;

const percentToTarget = data.percent_points;

const dayMapping = {
  Sunday: "Su",
  Monday: "M",
  Tuesday: "Tu",
  Wednesday: "W",
  Thursday: "Th",
  Friday: "F",
  Saturday: "Sa",
};

const WeeklyChart = () => {
  // Get the full width of the screen
  const fullWidth = Dimensions.get("window").width;
  const width = fullWidth - 2 * (fullWidth * 0.05); // subtracting 5% margin from both sides
  
  const height = 300;
  const margin = { top: 100, right: 15, bottom: 50, left: 15 };

  const zeroData = { day: "Zero" };
  for (let key in zoneData) {
    zeroData[key] = 0;
  }

  const transformedData = [zeroData].concat(
    Object.keys(dayMapping).map((day) => {
      const dayData = { day };
      for (let key in zoneData) {
        dayData[key] = zoneData[key][day];
      }
      return dayData;
    })
  );


  let zones = Object.keys(zoneData);
  let stackedData = d3.stack().keys(zones)(transformedData);

  const color = d3
    .scaleOrdinal()
    .domain(zones)
    .range(["#5AC8FA", "#34C759", "#FFCC2B", "#FF9522", "#FF3B30"]);

    const xScale = d3
    .scaleBand()
    .domain(["Zero"].concat(Object.values(dayMapping)))
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(transformedData, (d) => d3.sum(zones, (key) => d[key])),
    ])
    .range([height - margin.bottom, margin.top]);

  const area = d3
  .area()
  .x((d, i) => {
    // Adjust the x-coordinate for the placeholder
    if (i === 0) {
      return xScale("Zero") + xScale.step() / 2;
    }
    return xScale(["Zero"].concat(Object.values(dayMapping))[i]);
  })
  .y0((d) => yScale(d[0]))
  .y1((d) => yScale(d[1]))
  .curve(d3.curveMonotoneX);

  const cumulativeValueSaturday = d3.sum(zones, (zone) => zoneData[zone]["Saturday"]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height}>
        {stackedData.map((series, i) => (
          <Path key={i} d={area(series)} fill={color(series.key)} />
        ))}
        <G transform={`translate(0,${height - margin.bottom})`}>
          {xScale.domain().map((tick, index) => (
            <G key={index} transform={`translate(${xScale(tick)},0)`}>
            {tick !== "Zero" && (
                <Text y={30} fontSize={13} fontWeight='200' textAnchor="middle" color='#3B3B3B'>
                  {tick}
                </Text>
                )}
            </G>
          ))}
          <Line
            x1={margin.left}
            x2={width - margin.right}
            y1={0}
            y2={0}
            stroke="#EBECEB"
            strokeWidth={1}
          />
        </G>
                {/* Draw the green line */}
                <Line
          x1={xScale(dayMapping["Saturday"])}
          x2={xScale(dayMapping["Saturday"])}
          y1={height - margin.bottom}
          y2={yScale(cumulativeValueSaturday)} 
          stroke="#34C759"
          strokeWidth={1}
        />
        {/* Draw the "O" at the end of the line */}
        <Circle
          cx={xScale(dayMapping["Saturday"])}
          cy={yScale(cumulativeValueSaturday) - 7}
          r={6} // Adjust the radius as needed
          stroke="#34C759"
          strokeWidth={2}
          fill="white"
        />
        <Text
          x={xScale(dayMapping["Saturday"]) + 20}
          y={yScale(cumulativeValueSaturday) - 3}
          fontSize={12}
          fontWeight='200'
          textAnchor="middle"
          color='#3B3B3B' 
        >  {`${percentToTarget}%`}</Text>

      </Svg>
      </View>
  );
};

export default WeeklyChart;
