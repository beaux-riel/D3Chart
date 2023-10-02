import React from "react";
import { View, Dimensions } from "react-native";
import { Svg, Path, G, Text, Line, Circle, Rect } from "react-native-svg";
import * as d3 from "d3";
import data from "./data.json";

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
  const width = fullWidth - 2 * (fullWidth * 0.01); // subtracting 1% margin from both sides

  const height = 300;
  const margin = { top: 20, right: 15, bottom: 50, left: 15 };

  const zeroData = { day: "Zero" };
  for (let key in zoneData) {
    zeroData[key] = 0;
  }

  const currentDayIndex = new Date().getDay();
  const daysToInclude = Object.keys(dayMapping).slice(0, currentDayIndex + 1);

  const transformedData = [zeroData].concat(
    daysToInclude.map((day) => {
      const dayData = { day };
      for (let key in zoneData) {
        dayData[key] = zoneData[key][day];
      }
      return dayData;
    })
  );

  const zones = Object.keys(zoneData);
  const stackedData = d3.stack().keys(zones)(transformedData);

  const color = d3
    .scaleOrdinal()
    .domain(zones)
    .range(["#5AC8FA", "#34C759", "#FFCC2B", "#FF9522", "#FF3B30"]);

  const xScale = d3
    .scaleBand()
    .domain(["Zero"].concat(Object.values(dayMapping)))
    .range([0, width]);

  const cumulativeValueCurrentDay = d3.sum(
    zones,
    (zone) => zoneData[zone][Object.keys(dayMapping)[currentDayIndex]]
  );

  const yMax =
    cumulativeValueCurrentDay < 700
      ? 700
      : d3.max(transformedData, (d) => d3.sum(zones, (key) => d[key]));

  const yScale = d3
    .scaleLinear()
    .domain([0, yMax])
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
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Svg width={width} height={height}>
        {stackedData.map((series, i) => (
          <Path key={i} d={area(series)} fill={color(series.key)} />
        ))}
        {cumulativeValueCurrentDay < 700 && (
          <Line
            x1={margin.left}
            x2={width - margin.right}
            y1={yScale(700)}
            y2={yScale(700)}
            stroke="#34C759"
            strokeWidth={1}
            strokeDasharray="4,4" // This makes the line dashed
          />
        )}
        <G transform={`translate(0,${height - margin.bottom})`}>
          {xScale.domain().map((tick, index) => (
            <G key={index} transform={`translate(${xScale(tick)},0)`}>
              {tick !== "Zero" && (
                <Text
                  y={30}
                  fontSize={13}
                  fontWeight="200"
                  textAnchor="middle"
                  color="#3B3B3B"
                >
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
          x1={xScale(dayMapping[Object.keys(dayMapping)[currentDayIndex]])}
          x2={xScale(dayMapping[Object.keys(dayMapping)[currentDayIndex]])}
          y1={height - margin.bottom}
          y2={yScale(cumulativeValueCurrentDay)}
          stroke="#34C759"
          strokeWidth={1}
        />
        {cumulativeValueCurrentDay < 700 ? (
          <>
            <Circle
              cx={xScale(dayMapping[Object.keys(dayMapping)[currentDayIndex]])}
              cy={yScale(cumulativeValueCurrentDay) - 7}
              r={6}
              stroke="#34C759"
              strokeWidth={2}
              fill="white"
            />
            <Text
              x={
                xScale(dayMapping[Object.keys(dayMapping)[currentDayIndex]]) +
                24
              }
              y={yScale(cumulativeValueCurrentDay) - 3}
              fontSize={12}
              fontWeight="200"
              textAnchor="middle"
              color="#3B3B3B"
            >
              {`${percentToTarget}%`}
            </Text>
          </>
        ) : (
          <>
            {/* Flagpole */}
            <Line
              x1={xScale(dayMapping[Object.keys(dayMapping)[currentDayIndex]])}
              x2={xScale(dayMapping[Object.keys(dayMapping)[currentDayIndex]])}
              y1={yScale(cumulativeValueCurrentDay) - 20}
              y2={yScale(cumulativeValueCurrentDay) + 10}
              stroke="#34C759"
              strokeWidth={1}
            />
            {/* Flag */}
            <Rect
              x={
                xScale(dayMapping[Object.keys(dayMapping)[currentDayIndex]]) + 2
              }
              y={yScale(cumulativeValueCurrentDay) - 20}
              width={30}
              height={10}
              fill="#34C759"
            />
            <Text
              x={
                xScale(dayMapping[Object.keys(dayMapping)[currentDayIndex]]) +
                17
              }
              y={yScale(cumulativeValueCurrentDay) - 12}
              fontSize={9}
              fontWeight="200"
              textAnchor="middle"
              color="#3B3B3B"
            >
              {`${percentToTarget}%`}
            </Text>
          </>
        )}
      </Svg>
    </View>
  );
};

export default WeeklyChart;
