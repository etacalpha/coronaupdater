import React, { useState, useEffect } from "react";
import axios from "axios";
import Scrollbar from "react-scrollbars-custom";
import "./App.css";

function App() {
  const [data, setData] = useState();

  const fetchData = async () => {
    const [
      resSummary,
      resAllCountryTotals,
      resUSACountryTotals,
      resUsByState
      
    ] = await Promise.all([
      axios("https://corona.lmao.ninja/v2/all"),
      axios("https://corona.lmao.ninja/v2/countries"),
      axios("https://corona.lmao.ninja/v2/countries/USA"),
      axios("https://corona.lmao.ninja/v2/states"),
    ]);

    // all list sorted by Cases confirmed
    resAllCountryTotals.data.sort((a, b) =>
      a.active > b.active ? -1 : 1
    );
    resUsByState.data.sort((a, b) =>
      a.active > b.active ? -1 : 1
    );

    setData({
      summary: resSummary.data,
      allCountryTotals:resAllCountryTotals.data,
      usCountryTotals:resUSACountryTotals.data,
      usByState:resUsByState.data
    });
  };

  // Handle state
  useEffect(() => {

    try {
      fetchData();
    } catch (err) {
      //TODO add error handling
      console.log(err);
    }

    return () =>{
    }

  }, []);
  console.log("created by Steven Beard, email: etacalpha@gmail.com")
  if(!data) return (<div className="App" style={{ fontSize : '2em'}}>Loading...</div>)
  return (
    <main className="App">
      <header className={"box"}>
        <h2>Track the Coronavirus</h2>
        <span>(Updated: {Date(data.summary.updated).split('G')[0]})</span>
      </header>

      <article id="data.summary" className={"box"}>
          <h3>
            WORLD SUMMARY<hr></hr>
          </h3>
        <Scrollbar style={{ width: 370, height: 600 }}>
          <section id={"worldSummaryData"}>
            {data.allCountryTotals.map((item, index) => (
                  <section key={index + 400}>
                    <span key={index + 200} style={{ color: "red" }}>
                      {item.deaths.toLocaleString()}
                    </span>
                    <span key={index + 300} style={{ color: "yellow" }}>
                      {item.active.toLocaleString()}
                    </span>
                    <span key={index + 400} style={{ color: "green" }}>
                      {item.recovered.toLocaleString()}
                    </span>
                    {item.country}
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
                {data.usCountryTotals.deaths.toLocaleString()
                  }
              </h3>
            </section>
            <section style={{ color: "yellow" }}>
              <h3>Active</h3>
              <h3>
                {data.usCountryTotals.active.toLocaleString()
                  }
              </h3>
            </section>
            <section style={{ color: "green" }}>
              <h3>Recovered</h3>
              <h3>
                {data.usCountryTotals.recovered.toLocaleString()
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
                {data.summary.deaths.toLocaleString()
                  }
              </h3>
            </section>
            <section style={{ color: "yellow" }}>
              <h3>Active</h3>
              <h3>
                {data.summary.active.toLocaleString()
                  }
              </h3>
            </section>
            <section style={{ color: "green" }}>
              <h3>Recovered</h3>
              <h3>
                {data.summary.recovered.toLocaleString()
                  }
              </h3>
            </section>
          </section>
        </section>
        <section className={"box"}>
          <p>
            <strong>Thank you</strong> for visiting this page. All the data for
            this page comes from an <a href={"https://github.com/novelcovid/api"}>API.</a>{" "}
             This page was created for practice and I do not guarantee the veracity of this
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
            {data.usByState.map((item, index) => (
                  <section key={index + 400}>
                    <span key={index + 200} style={{ color: "red" }}>
                      {item.deaths.toLocaleString()}
                    </span>
                    <span key={index + 300} style={{ color: "yellow" }}>
                      {item.active.toLocaleString()}
                    </span>
                    {item.state}
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
