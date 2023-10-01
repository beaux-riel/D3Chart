import React from "react";
import { View, Dimensions } from "react-native";
import { Svg, Path, G, Text, Line } from "react-native-svg";
import * as d3 from "d3";
import data from "./data.json";

const userData = data.heart_chart_cumulative_format2;

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
  const width = Dimensions.get("window").width - 2 * (Dimensions.get("window").width * 0.05); // subtracting 5% margin from both sides

  const height = 250;
  const margin = { top: 20, right: 10, bottom: 50, left: 10 };

  const zeroData = { day: "Zero" };
  for (let key in userData) {
    zeroData[key] = 0;
  }

  const transformedData = [zeroData].concat(
    Object.keys(dayMapping).map((day) => {
      const dayData = { day };
      for (let key in userData) {
        dayData[key] = userData[key][day];
      }
      return dayData;
    })
  );

  let mygroups = Object.keys(userData);
  let stackedData = d3.stack().keys(mygroups)(transformedData);

  const color = d3
    .scaleOrdinal()
    .domain(mygroups)
    .range(["#5AC8FA", "#34C759", "#FFCC2B", "#FF9522", "#FF3B30"]);

    const xScale = d3
    .scaleBand()
    .domain(["Zero"].concat(Object.values(dayMapping)))
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(transformedData, (d) => d3.sum(mygroups, (key) => d[key])),
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

  return (
    <View borderWidth="1" margin="5%" borderColor='#D7DAD8'>
      <Svg width={width} height={height}>
        {stackedData.map((series, i) => (
          <Path key={i} d={area(series)} fill={color(series.key)} />
        ))}
        <G transform={`translate(0,${height - margin.bottom})`}>
          {xScale.domain().map((tick, index) => (
            <G key={index} transform={`translate(${xScale(tick)},0)`}>
            {tick !== "Zero" && (
                <Text y={30} fontSize={15} textAnchor="middle" color='#3B3B3B'>
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
      </Svg>
    </View>
  );
};

export default WeeklyChart;
