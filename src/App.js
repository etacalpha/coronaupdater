import React, { useState, useEffect } from "react";
import Scrollbar from "react-scrollbars-custom";
import "./App.css";

function App() {
  const [worldSummary, setWorldSummary] = useState(null);
  const [usDeaths, setusDeaths] = useState(null);
  const [usConfirmed, setusConfirmed] = useState(null);
  const [usRecovered, setusRecovered] = useState(null);

  useEffect(() => {
    try {
      fetch("https://api.covid19api.com/summary")
        .then(res => res.json())
        .then(setWorldSummary);

      fetch("https://api.covid19api.com/country/US/status/deaths")
        .then(res => res.json())
        .then(setusDeaths);

      fetch("https://api.covid19api.com/country/US/status/confirmed")
        .then(res => res.json())
        .then(setusConfirmed);

      fetch("https://api.covid19api.com/country/US/status/recovered")
        .then(res => res.json())
        .then(setusRecovered);
    } catch (err) {
      console.log(err);
    }
  }, []);

  let updateDate = null;
  let totalDeath = null;
  let totalConfirmed = null;
  let totalRecovered = null;
  let usTotal = null;
  if (worldSummary) {
    worldSummary.Countries.sort((a, b) =>
      a.TotalConfirmed > b.TotalConfirmed ? -1 : 1
    );
    updateDate = new Date(worldSummary.Date).toString().split("G")[0];
    totalDeath = worldSummary.Countries.reduce((a, b) => {
      return a + b.TotalDeaths;
    }, 0).toLocaleString();
    totalConfirmed = worldSummary.Countries.reduce((a, b) => {
      return a + b.TotalConfirmed;
    }, 0).toLocaleString();
    totalRecovered = worldSummary.Countries.reduce((a, b) => {
      return a + b.TotalRecovered;
    }, 0).toLocaleString();
    usTotal = worldSummary.Countries.filter(
      Countries => Countries.Country === "US"
    );
  }

  let usComplete;

  if (usRecovered !== null && usDeaths !== null && usConfirmed !== null) {
    const arrayScrubber = (arr, newKey) => {
      return arr
        .filter(item => item.Date === "2020-03-18T00:00:00Z")
        .map(item => ({
          Country: item.Country,
          Province: item.Province,
          Lat: item.Lat,
          Lon: item.Lon,
          Date: item.Date,
          [newKey]: item.Cases
        }))
        .sort((a, b) => {
          a = new Date(a.Date);
          b = new Date(b.Date);
          return a > b ? -1 : a < b ? 1 : 0;
        });
    };
    let deathScrubbed = arrayScrubber(usDeaths, "death");
    let confirmedScrubbed = arrayScrubber(usConfirmed, "confirmed");
    let recoveredScrubbed = arrayScrubber(usRecovered, "recovered");

    const mergeArrays = (arrays, prop) => {
      const merged = {};

      arrays.forEach(arr => {
        arr.forEach(item => {
          merged[item[prop]] = Object.assign({}, merged[item[prop]], item);
        });
      });

      return Object.values(merged);
    };
    let holder = mergeArrays([deathScrubbed, confirmedScrubbed], "Province");

    if (holder)
      usComplete = mergeArrays([holder, recoveredScrubbed], "Province");
  }

  if (usComplete) usComplete.sort((a, b) => b.confirmed - a.confirmed);
  return (
    <main className="App">
      <header className={"box"}>
        <h2>Track the Coronavirus</h2>
        <p>Data is sourced from <a href={'https://github.com/CSSEGISandData/COVID-19'}>Johns Hopkins CSSE</a></p>
        <span>(Updated: {updateDate})</span>
      </header>

      <article id="worldSummary" className={"box"}>
        <span>
          <h3>
            WORLD SUMMARY<hr></hr>
          </h3>
        </span>
        <Scrollbar style={{ width: 370, height: 600 }}>
          <section id={"worldSummaryData"}>
            {worldSummary
              ? worldSummary.Countries.map((item, index) => (
                  <section key={index + 400}>
                    <span key={index + 200} style={{ color: "red" }}>
                      {item.TotalDeaths.toLocaleString()}
                    </span>
                    <span key={index + 300} style={{ color: "yellow" }}>
                      {item.TotalConfirmed.toLocaleString()}
                    </span>
                    <span key={index + 400} style={{ color: "green" }}>
                      {item.TotalRecovered.toLocaleString()}
                    </span>
                    {item.Country}
                    <hr />
                  </section>
                ))
              : null}
          </section>
        </Scrollbar>
      </article>

      <article id={"totals"}>
        <section className={"box"}>
          <h1>
            USA Totals<hr></hr>
          </h1>
          <section id={"worldTotalsData"}>
            <section style={{ color: "red" }}>
              <h3>Deaths</h3>
              <h3>
                {usTotal ? usTotal[0].TotalDeaths.toLocaleString() : null}
              </h3>
            </section>
            <section style={{ color: "yellow" }}>
              <h3>Confirmed</h3>
              <h3>
                {usTotal ? usTotal[0].TotalConfirmed.toLocaleString() : null}
              </h3>
            </section>
            <section style={{ color: "green" }}>
              <h3>Recovered</h3>
              <h3>
                {usTotal ? usTotal[0].TotalRecovered.toLocaleString() : null}
              </h3>
            </section>
          </section>
        </section>

        <section className={"box"}>
          <h1>
            World Totals<hr></hr>
          </h1>
          <section id={"worldTotalsData"}>
            <section style={{ color: "red" }}>
              <h3>Deaths</h3>
              <h3>{totalDeath}</h3>
            </section>
            <section style={{ color: "yellow" }}>
              <h3>Confirmed</h3>
              <h3>{totalConfirmed}</h3>
            </section>
            <section style={{ color: "green" }}>
              <h3>Recovered</h3>
              <h3>{totalRecovered}</h3>
            </section>
          </section>
        </section>
        <section className={"box"}>
          <p>
            <strong>Thank you</strong> for visiting this page. All the data for
            this page comes from an <a href={"https://covid19api.com/#"}>API</a>{" "}
            by <a href={"https://ksred.me/"}>Kyle Redelinghuys</a>. This page
            was created for practice and I do not guarantee the veracity of this
            information.
          </p>
        </section>
      </article>

      <article id="usSummary" className={"box"}>
        <span>
          <h3>
            UNITED STATES SUMMARY<hr></hr>
          </h3>
        </span>
        <Scrollbar style={{ width: 370, height: 600 }}>
          <section id={"usSummaryData"}>
            {usComplete
              ? usComplete.map((item, index) => (
                  <section key={index + 400}>
                    <span key={index + 200} style={{ color: "red" }}>
                      {item.death}
                    </span>
                    <span key={index + 300} style={{ color: "yellow" }}>
                      {item.confirmed}
                    </span>
                    <span key={index + 400} style={{ color: "green" }}>
                      {item.recovered}
                    </span>
                    {item.Province}
                    <hr />
                  </section>
                ))
              : null}
          </section>
        </Scrollbar>
      </article>
    </main>
  );
}

export default App;
