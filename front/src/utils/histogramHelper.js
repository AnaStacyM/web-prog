import _ from "lodash";
import moment from "moment";
let prevPeriod = 0;
export const getPlotData = (
  plotData,
  startedAt,
  endAt,
  detalization = "hour",
  options = {
    average: true,
    prevPeriod: false,
  }
) => {
  let sum = 0;
  const normalizedPlotData = plotData.filter((d) =>
    moment(d.attributes.createdAt).isBetween(startedAt, endAt)
  );
  const data = Object.entries(
    _.groupBy(normalizedPlotData, function (data) {
      return moment(data.attributes.createdAt).startOf(detalization).format();
    })
  )
    .map(([date, data]) => {
      const value =
        data.reduce((p, c) => p + c.attributes.value, 0) / data.length;
      sum += value;
      return {
        name: moment(date).format(
          detalization === "hour" ? "MMMM Do YYYY hh:mm" : "MMMM Do YYYY"
        ),
        value,
      };
    })
    .reverse();
  const average = sum / data.length;
  if (options.average) data.push({ name: "Average", value: average });
  if (options.prevPeriod)
    data.push({
      name: "Prev consumption diff",
      value: average - prevPeriod,
    });
  prevPeriod = average;
  return data;
};
