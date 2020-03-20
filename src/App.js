import React, { useState, useEffect } from "react";
import axios from "axios";
// import Scrollbar from "react-scrollbars-custom";
import "./App.css";

function App() {
  const [data, setData] = useState();

  // Call apis to retrieve data for the page ** hard coded for single use on render
  const fetchData = async () => {
    const [
      resSummary,
      resUsDeaths,
      resUsConfirmed,
      resUsRecovered
    ] = await Promise.all([
      axios("https://api.covid19api.com/summary"),
      axios("https://api.covid19api.com/country/US/status/deaths"),
      axios("https://api.covid19api.com/country/US/status/confirmed"),
      axios("https://api.covid19api.com/country/US/status/recovered")
    ]);
    setData({
      summary: resSummary,
      usDeaths: resUsDeaths,
      usConfirmed: resUsConfirmed,
      usRecovered: resUsRecovered
    });
  };

  /**
   * Return combined total of key for all objects
   * @param {Object[]} array
   * @param {string} key - obj key to add
   */
  const valueAdd = (array, key) => {
    array
      .reduce((a, b) => {
        return a + b[key];
      }, 0)
      .toLocaleString();
  };

  /**
   * Use only the items with the most recent date and prepare items to be merged (Cases:n needs to have a unique key)
   * @param {Object[]} array
   * @param {string} newKey - name of key to change to
   * @param {string} oldKey - name of key to change from
   * @param {Date} lastUpdateTime - Date to filter objects
   */
  const arrayScrubber = (array, lastUpdateTime, newKey, oldKey) => {
    return array
      .filter(item => new Date(item.Date) === lastUpdateTime)
      .map(item => ({
        ...item,
        [newKey]: item[oldKey]
      }));
  };

  /**
   * Merge (not concat) objects from each array
   * @param {Array.Array.<Objects>} arrays
   * @param {string} key - key to merge on
   */
  const mergeArrays = (arrays, key) => {
    const merged = {};
    arrays.forEach(arr => {
      arr.forEach(item => {
        merged[item[key]] = Object.assign({}, merged[item[key]], item);
      });
    });
    return Object.values(merged);
  };

  /**
   * Return most recent date
   * @param {Object[]} array
   * @param {'string'} key for date value in objects
   */
  const lastUpdated = (array, key) => {
    new Date(
      Math.max.apply(
        null,
        array.map(function(item) {
          return new Date(item["key"]);
        })
      )
    );
  };

  // Handle state
  useEffect(() => {
    try {
      fetchData();
    } catch (err) {
      //TODO add error handling
      console.log(err);
    }
  }, []);

  // add new state variables
  useEffect(() => {
    if (data.summary && data.summary !== "") {
      // all list sorted by Cases confirmed
      data.summary.Countries.sort((a, b) =>
        a.TotalConfirmed > b.TotalConfirmed ? -1 : 1
      );

        // Get Totals for all countries
        const totalDeath = valueAdd(data.summary.Countries, "TotalDeaths");
        const totalConfirmed = valueAdd(data.summary.Countries, "TotalConfirmed");
        const totalRecovered = valueAdd(data.summary.Countries, "TotalRecovered");
  
        const usTotal = data.summary.Countries.filter(
          Countries => Countries.Country === "US"
        );

      // Get last date usDeaths list / summary was updated
      const lastUsUpdate = lastUpdated(usDeaths, "Date");
      const updateDate = new Date(data.summary.Date).toString().split("G")[0];

      // scrub arrays for most recent time and change object key to prepare for merge
      let deathScrubbed = arrayScrubber(
        usDeaths,
        "death",
        "Cases",
        lastUsUpdate
      );
      let confirmedScrubbed = arrayScrubber(
        usConfirmed,
        "confirmed",
        "Cases",
        lastUsUpdate
      );
      let recoveredScrubbed = arrayScrubber(
        usRecovered,
        "recovered",
        "Cases",
        lastUsUpdate
      );

      // Merge arrays to combine aggregate data for death, confirmed, recovered 
      let holder = mergeArrays([deathScrubbed, confirmedScrubbed], "Province");
      let usComplete;
      if (holder) usComplete = mergeArrays([holder, recoveredScrubbed], "Province");

      // sort array for use by confirmation
      if (usComplete) usComplete.sort((a, b) => b.confirmed - a.confirmed);

      setData({
        ...data,
        lastUpdated: updateDate,
        worldTotatDeaths: totalDeath,
        worldTotalConfirmed: totalConfirmed,
        worldTotalRecovered: totalRecovered,
        usTotals: usTotal,
        usCompleted: usComplete
      });
    }
  }, []);

  return (
    <main className="App">
      <header className={"box"}>
        <h2>Track the Coronavirus</h2>
        <p>
          Data is sourced from{" "}
          <a href={"https://github.com/CSSEGISandData/COVID-19"}>
            Johns Hopkins CSSE
          </a>
        </p>
        <span>(Updated: {updateDate})</span>
      </header>

      <article id="data.summary" className={"box"}>
        <span>
          <h3>
            WORLD SUMMARY<hr></hr>
          </h3>
        </span>
        <Scrollbar style={{ width: 370, height: 600 }}>
          <section id={"data.summaryData"}>
            {data.summary
              ? data.summary.Countries.map((item, index) => (
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
                      {item.confirmed.toLocaleString()}
                    </span>
                    <span key={index + 400} style={{ color: "green" }}>
                      {item.recovered.toLocaleString()}
                    </span>
                    {item.Province.toLocaleString()}
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
