import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS} from 'chart.js/auto'

function Graph({ activity }) {

  return (
    <div style={{width: 700}}>
      <Bar data={activity}/>
    </div>
  ); 
}

export default Graph;

