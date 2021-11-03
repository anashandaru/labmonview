// REPLACE <...> BY YOUR FIREBASE PROJECT CONFIGURATION:
// const config = {
//     apiKey: "AIzaSyCsSxN_pAQbl_ePNSyRY8oJhx_mtvTAA3o",
//     authDomain: "labmon-5dd47.firebaseapp.com",
//     databaseURL: "https://labmon-5dd47-default-rtdb.asia-southeast1.firebasedatabase.app",
//     // databaseURL: "https://labmon-5dd47-default-rtdb.firebaseio.com",
//     projectId: "labmon-5dd47",
//     storageBucket: "labmon-5dd47.appspot.com",
//     messagingSenderId: "740882006919"
//   };

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCsSxN_pAQbl_ePNSyRY8oJhx_mtvTAA3o",
    authDomain: "labmon-5dd47.firebaseapp.com",
    databaseURL: "https://labmon-5dd47-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "labmon-5dd47",
    storageBucket: "labmon-5dd47.appspot.com",
    messagingSenderId: "740882006919",
    appId: "1:740882006919:web:27be9126e2033f50718922",
    measurementId: "G-9XL497Q46S"
  };

  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Number of last elements to work with, in the 'timestamped_measures' node of the database: 
const nbOfElts = 50;

// The big picture: EACH TIME A VALUE CHANGES in the 'timestamped_measures' node, e.g.
// when a new timestamped measure has been pushed to that node,
// we make an array of the last 'nbOfElts' timestamps
// and another array of the last 'nbOfElts' luminosity values.
// This is because plotly.js, our plotting library, requires arrays of data, one for x and one for y.
// Those sliding arrays produce a live data effect.
// -----
// See https://firebase.google.com/docs/database/web/lists-of-data for trigger syntax:
firebase.database().ref('measurements').limitToLast(nbOfElts).on('value', ts_measures => {
    // If you want to get into details, read the following comments :-)
    // 'ts_measures' is a snapshot raw Object, obtained on changed value of 'timestamped_measures' node
    // e.g. a new push to that node, but is not exploitable yet.
    // If we apply the val() method to it, we get something to start work with,
    // i.e. an Object with the 'nbOfElts' last nodes in 'timestamped_measures' node.
    console.log(ts_measures.val());
    // => {-LIQgqG3c4MjNhJzlgsZ: {timestamp: 1532694324305, value: 714}, -LIQgrs_ejvxcF0MqFre: {…}, … }

    // We prepare empty arrays to welcome timestamps and luminosity values:
    let timestamps = [];
    let temp = [];
    let humi = [];

    // Next, we iterate on each element of the 'ts_measures' raw Object
    // in order to fill the arrays.
    // Let's call 'ts_measure' ONE element of the ts_measures raw Object
    // A handler function written here as an anonymous function with fat arrow syntax
    // tells what to do with each element:
    // * apply the val() method to it to gain access to temp of 'timestamp' and 'value',
    // * push those latter to the appropriate arrays.
    // Note: The luminosity value is directly pushed to 'temp' array but the timestamp,
    // which is an Epoch time in milliseconds, is converted to human date
    // thanks to the moment().format() function coming from the moment.js library.    
    
    ts_measures.forEach(ts_measure => {
        //console.log(ts_measure.val().timestamp, ts_measure.val().value);
        timestamps.push(moment(ts_measure.val().timestamp).format('YYYY-MM-DD HH:mm:ss'));
        temp.push(ts_measure.val().temp);
        humi.push(ts_measure.val().humi);
    });

    // Get a reference to the DOM node that welcomes the plot drawn by Plotly.js:
    labAirPlotDiv = document.getElementById('labAir');

    // We generate x and y data necessited by Plotly.js to draw the plot
    // and its layout information as well:
    // See https://plot.ly/javascript/getting-started/

    const config = {
        displayModeBar: false, // this is the line that hides the bar.
        responsive: true,
      };

    var trace1 = {
        x: timestamps,
        y: temp,
        name: 'Suhu',
        type: 'scatter',
        mode: 'lines+markers'
      };
      
      var trace2 = {
        x: timestamps,
        y: humi,
        name: 'Kelembaban',
        yaxis: 'y2',
        type: 'scatter',
        mode: 'lines+markers'
      };
      
      var data = [trace1, trace2];
      
      var layout = {
        title: '<b>Lab Air</b>',
        titlefont: {
            family: 'Courier New, monospace',
            size: 16,
            color: '#000'
        },
        xaxis: {
            showgrid: false,
            linewidth: 2,
            fixedrange: true
        },
        yaxis: {
            title: '<b>Suhu (C)</b>',
            showgrid: false,
            linewidth: 2,
            titlefont: {
                family: 'Courier New, monospace',
                size: 14,
                color: '#000'
            },
            fixedrange: true
        },
        yaxis2: {
          title: '<b>Kelembaban (%)</b>',
          showgrid: false,
          linewidth: 2,
        //   titlefont: {color: 'rgb(148, 103, 189)'},
        //   tickfont: {color: 'rgb(148, 103, 189)'},
          overlaying: 'y',
          side: 'right',
          titlefont: {
            family: 'Courier New, monospace',
            size: 16,
            color: '#000'
          },
          fixedrange: true
        },
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1
          }
      };
      
      Plotly.newPlot(labAirPlotDiv, data, layout, config);
});
