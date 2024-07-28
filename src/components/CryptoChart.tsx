import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  TimeScale
);

interface PriceData {
  x: Date;
  y: number;
}

const generateCorrelatedData = (prices: number[]): number[] => {
  return prices.map((price) => Math.floor(price / 1000 + Math.random() * 10));
};

const CryptoChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1"
        );
        if (response.data && response.data.prices) {
          const dates = response.data.prices.map(
            (price: [number, number]) => new Date(price[0])
          );
          const priceData = response.data.prices.map(
            (price: [number, number]) => ({
              x: new Date(price[0]),
              y: price[1],
            })
          );
          const prices = response.data.prices.map(
            (price: [number, number]) => price[1]
          );
          const postCountData = generateCorrelatedData(prices);

          setChartData({
            labels: dates,
            datasets: [
              {
                label: "Bitcoin Price",
                data: priceData,
                borderColor: "rgba(75,192,192,1)",
                fill: false,
                yAxisID: "y",
              },
              {
                label: "Twitter Posts",
                data: postCountData.map((count, index) => ({
                  x: dates[index],
                  y: count,
                })),
                borderColor: "rgba(255,99,132,1)",
                fill: false,
                yAxisID: "y1",
              },
            ],
          });
        } else {
          setError("No data available");
        }
      } catch (error) {
        setError("Error fetching the data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
        },
        min: chartData
          ? chartData.labels[chartData.labels.length - 20]
          : undefined,
        max: chartData
          ? chartData.labels[chartData.labels.length - 1]
          : undefined,
      },
      y: {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "Price (USD)",
        },
      },
      y1: {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "Twitter Posts",
        },
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "x" as const,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x" as const,
        },
      },
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ width: "80vw", height: "50vh" }}>
      <h2>Bitcoin Price Chart</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CryptoChart;
