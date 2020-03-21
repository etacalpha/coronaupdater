import React, { useState, useEffect } from "react";
import axios from "axios";
import Scrollbar from "react-scrollbars-custom";
import "./App.css";

function App() {
  const [data, setData] = useState();

  /**
   * Merge (not concat) objects from each array
   * @param {[object[],object[]]} arrays
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
   * Return combined total of key for all objects
   * @param {Object[]} array
   * @param {string} key - obj key to add
   */
  const valueAdd = (array, key) => {
    return array.reduce((a, b) => a + b[key], 0);
  };

  /**
   * Return most recent date
   * @param {Object[]} array
   * @param {'string'} key for date value in objects
   */
  const lastUpdated = (array, key) => {
    return array
      .map(function(item) {
        return item[key];
      })
      .sort()
      .reverse()[0];
  };

  /**
   * Use only the items with the most recent date and prepare items to be merged (Cases:n needs to have a unique key)
   * @param {Object[]} array
   * @param {string} newKey - name of key to change to
   * @param {string} oldKey - name of key to change from
   * @param {Date} lastUpdateTime - Date to filter objects
   */
  const arrayScrubber = (array, newKey, oldKey, lastUpdateTime) => {
    return array
      .filter(item => item.Date === lastUpdateTime)
      .map(item => ({
        ...item,
        [newKey]: item[oldKey]
      }));
  };

  // Handle state
  useEffect(() => {
    let isCurrent = true

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
  
      // all list sorted by Cases confirmed
      resSummary.data.Countries.sort((a, b) =>
        a.TotalConfirmed > b.TotalConfirmed ? -1 : 1
      );
  
      // Get Totals for all countries
      const totalDeath = valueAdd(resSummary.data.Countries, "TotalDeaths");
      const totalConfirmed = valueAdd(
        resSummary.data.Countries,
        "TotalConfirmed"
      );
      const totalRecovered = valueAdd(
        resSummary.data.Countries,
        "TotalRecovered"
      );
  
      const usTotal = resSummary.data.Countries.filter(
        Countries => Countries.Country === "US"
      );
  
      // Get last date usDeaths list / summary was updated
      const updateDate = new Date(resSummary.data.Date)
        .toString()
        .split("G")[0];
  
      const lastUsDeathUpdate = lastUpdated(resUsDeaths.data, "Date");
      const lastUsConfirmedUpdate = lastUpdated(resUsConfirmed.data, "Date");
      const lastUsRecoveredUpdate = lastUpdated(resUsRecovered.data, "Date");
  
      // scrub arrays for most recent time and change object key to prepare for merge
      let deathScrubbed = arrayScrubber(
        resUsDeaths.data,
        "death",
        "Cases",
        lastUsDeathUpdate
      );
  
      let confirmedScrubbed = arrayScrubber(
        resUsConfirmed.data,
        "confirmed",
        "Cases",
        lastUsConfirmedUpdate
      );
      let recoveredScrubbed = arrayScrubber(
        resUsRecovered.data,
        "recovered",
        "Cases",
        lastUsRecoveredUpdate
      );
      // Merge arrays to combine aggregate data for death, confirmed, recovered
      let holder = mergeArrays([deathScrubbed, confirmedScrubbed], "Province");
      let usComplete;
      if (holder)
        usComplete = mergeArrays([holder, recoveredScrubbed], "Province");
  
      // sort array for use by confirmation
      if (usComplete) usComplete.sort((a, b) => b.confirmed - a.confirmed);
  
      setData({
        summary: resSummary.data,
        usDeaths: resUsDeaths.data,
        usConfirmed: resUsConfirmed.data,
        usRecovered: resUsRecovered.data,
        lastUpdated: updateDate,
        worldTotalDeaths: totalDeath,
        worldTotalConfirmed: totalConfirmed,
        worldTotalRecovered: totalRecovered,
        usTotals: usTotal,
        usCompleted: usComplete
      });
    };

    try {
      fetchData();
    } catch (err) {
      //TODO add error handling
      console.log(err);
    }

    return () =>{
      isCurrent = false
    }

  }, []);
  console.log("created by Steven Beard, email: etacalpha@gmail.com")
  if(!data) return (<div className="App" style={{ fontSize : '2em'}}>Loading...</div>)
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
        <span>(Updated: {data.lastUpdated })</span>
      </header>

      <article id="data.summary" className={"box"}>
          <h3>
            WORLD SUMMARY<hr></hr>
          </h3>
        <Scrollbar style={{ width: 370, height: 600 }}>
          <section id={"worldSummaryData"}>
            {data.summary.Countries.map((item, index) => (
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
              }
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
                {data.usTotals[0].TotalDeaths.toLocaleString()
                  }
              </h3>
            </section>
            <section style={{ color: "yellow" }}>
              <h3>Confirmed</h3>
              <h3>
                {data.usTotals[0].TotalConfirmed.toLocaleString()
                  }
              </h3>
            </section>
            <section style={{ color: "green" }}>
              <h3>Recovered</h3>
              <h3>
                {data.usTotals[0].TotalRecovered.toLocaleString()
                  }
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
              <h3>
                {data.worldTotalDeaths.toLocaleString()
                  }
              </h3>
            </section>
            <section style={{ color: "yellow" }}>
              <h3>Confirmed</h3>
              <h3>
                {data.worldTotalConfirmed.toLocaleString()
                  }
              </h3>
            </section>
            <section style={{ color: "green" }}>
              <h3>Recovered</h3>
              <h3>
                {data.worldTotalRecovered.toLocaleString()
                  }
              </h3>
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
          <h3>
            UNITED STATES SUMMARY<hr></hr>
          </h3>
        <Scrollbar style={{ width: 370, height: 600 }}>
          <section id={"usSummaryData"}>
            {data.usCompleted.map((item, index) => (
                  <section key={index + 400}>
                    <span key={index + 200} style={{ color: "red" }}>
                      {item.death}
                    </span>
                    <span key={index + 300} style={{ color: "yellow" }}>
                      {item.confirmed.toLocaleString()}
                    </span>
                    <span key={index + 400} style={{ color: "green" }}>
                      {item.recovered}
                    </span>
                    {item.Province}
                    <hr />
                  </section>
                ))
              }
          </section>
        </Scrollbar>
      </article>
    </main>
  );
}

export default App;
