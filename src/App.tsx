import React, { useEffect, useState } from "react";
import {
  ClientFactory,
  INodeStatus,
  IAccount,
  DefaultProviderUrls,
} from "@massalabs/massa-web3";

const baseAccount = {
  publicKey: "8jZN8yPpCMMPgpkranQ6WKUtUYaJWufLifeMTQsdwD1VaN52GF",
  privateKey: "MKjCqHrGxQ3ypDRTwjE3tyGeUpFQ88cqs7bk8uhHTQYQ4xURW",
  address: "JKpA6GY5jnSUD675nA6ktvzjwuZJvCTG9jmqTknpgjPGNAwR7",
} as IAccount;

type TNodeStatus = INodeStatus | null;

const web3Client = ClientFactory.createDefaultClient(
  DefaultProviderUrls.LABNET,
  false,
  baseAccount
);

const sc_liquidity = "2Si4dng3P7Sg4xfTNdExGzd283AqWu8nq8i4qTS8H3H5nPYR9T";
const lp_token = "SDhY4F1mQHaerVBRdpau6nHnduvjgzr27vc9Md7ZzSS4p5wHF";

const tokenA = {
  name: "MASSA",
  userBalance: 0,
};

const tokenB = {
  name: "BITCOIN",
  userBalance: 0,
};

const App = () => {
  const [isInvert, setIsInvert] = useState<boolean>(false);

  function handleSwap() {
    let originToken;
    let destinationToken;
    if (!isInvert) {
      originToken = addressA;
      destinationToken = addressB;
    } else {
      originToken = addressB;
      destinationToken = addressA;
    }


    let amount = document.querySelectorAll<HTMLInputElement>(".valForSwap")[0].value;
    var call_params_str =
      `{"amount":` +
      amount +
      `,"destination_token":` +
      destinationToken +
      `,"origin_token":` +
      originToken +
      `}`;
    web3Client
      .smartContracts()
      .callSmartContract(
        {
          /// storage fee for taking place in books
          fee: 0,
          /// The maximum amount of gas that the execution of the contract is allowed to cost.
          maxGas: 70000000,
          /// The price per unit of gas that the caller is willing to pay for the execution.
          gasPrice: 0,
          /// Extra coins that are spent from the caller's parallel balance and transferred to the target
          parallelCoins: 0,
          /// Extra coins that are spent from the caller's sequential balance and transferred to the target
          sequentialCoins: 0,
          /// Target smart contract address
          targetAddress: sc_liquidity,
          /// Target function name. No function is called if empty.
          functionName: "swap",
          /// Parameter to pass to the target function
          parameter: call_params_str,
        },
        baseAccount
      )
      .then(function (txid) {
        console.log("transfer", call_params_str, txid);
      });
  }

  const [balanceA, setBalanceA] = useState<number>(0);
  const [balanceB, setBalanceB] = useState<number>(0);
  const [nbLPToken, setNbLPToken] = useState<number>(0);

  // setInterval(() => {
  //   console.log(nbLPToken);
  // }, 500);

  const addressA = "ZyYV2SJpHSw3x9YkWBKdj9eg6eQqJcHgWLTXFRWdBSaan9kR1";
  const addressB = "27v8xHE8WJwTaZ5jeFfsYV4jn3nhW1E7UXea4pteWcSN5WtSDC";

  useEffect(() => {
    web3Client
      .smartContracts()
      .getDatastoreEntry(addressA, "bal" + baseAccount.address)
      .then((res) => {
        console.log(res);
        if (res != undefined) setBalanceA(parseInt(res.candidate));
      });

    web3Client
      .smartContracts()
      .getDatastoreEntry(addressB, "bal" + baseAccount.address)
      .then((res) => {
        console.log(res);
        if (res != undefined) setBalanceB(parseInt(res.candidate));
      });

    web3Client
      .smartContracts()
      .getDatastoreEntry(addressA, "NAME")
      .then((res) => {
        if (res != undefined) tokenA.name = res.candidate.toUpperCase();
      });

    web3Client
      .smartContracts()
      .getDatastoreEntry(addressB, "NAME")
      .then((res) => {
        if (res != undefined) {
          tokenB.name = res.candidate.toUpperCase();
        }
      });

    web3Client
      .smartContracts()
      .getDatastoreEntry(lp_token, "bal" + baseAccount.address)
      .then((res) => {
        if (res != undefined) {
          console.log(res);
          setNbLPToken(parseInt(res.candidate));
        }
      });
    setIsInvert(false);
  }, []);

  useEffect(() => {
    tokenA.userBalance = balanceA;
    tokenB.userBalance = balanceB;
  }, [balanceA, balanceB]);

  const [whichWindow, setWhichWindow] = useState<number>(0);
  const spanNav = document.querySelectorAll(".tab");

  for (let i = 0; i < 3; i++) {
    spanNav[i]?.addEventListener("click", () => {
      for (let j = 0; j < 3; j++) {
        spanNav[j]?.classList.remove("active");
        setWhichWindow(i);
      }
      spanNav[i]?.classList.add("active");
    });
  }

  function addLiquidity() {
    let tokenA_amount;
    let tokenB_amount;
    if (
      document.querySelectorAll(".valForLiquidity")[0] != undefined &&
      document.querySelectorAll(".valForLiquidity")[1] != undefined
    ) {
      tokenA_amount =
        document.querySelectorAll<HTMLInputElement>(".valForLiquidity")[0]
          .value;
      tokenB_amount =
        document.querySelectorAll<HTMLInputElement>(".valForLiquidity")[1]
          .value;
    }
    var call_params_str = `{
        "tokenA_amount": ${tokenA_amount},
        "tokenB_amount": ${tokenB_amount}
      }`;
    var call_params = {
      tokenA_amount: tokenA_amount,
      tokenB_amount: tokenB_amount,
    };
    web3Client
      .smartContracts()
      .callSmartContract(
        {
          fee: 0,
          maxGas: 70000000,
          gasPrice: 0,
          parallelCoins: 0,
          sequentialCoins: 0,
          targetAddress: sc_liquidity,
          functionName: "addLiquidity",
          // parameter: call_params_str,
          parameter: JSON.stringify(call_params),
        },
        baseAccount
      )
      .then(function (txid) {
        console.log("addLiquidity", call_params_str, txid);
      });
  }

  const duraction = document.querySelectorAll(".dur");

  for (let i = 0; i < 3; i++) {
    duraction[i]?.addEventListener("click", () => {
      for (let j = 0; j < 3; j++) {
        duraction[j]?.classList.remove("selected");
      }
      duraction[i]?.classList.add("selected");
    });
  }

  return (
    <div className="App">
      <header>
        <div className="header-logo">MassOption</div>
        <nav>
          <span className="active tab">Swap</span>
          <span className="tab">Pool</span>
          <span className="tab">Options</span>
        </nav>
      </header>
      <div className="main-container">
        {whichWindow === 0 ? (
          <div className="container-events">
            <h2>Swap</h2>
            <div className="container-exchange">
              <div className="container-money">
                <div className="line-money">
                  <span className="coin">
                    {isInvert ? tokenB.name : tokenA.name}
                  </span>
                  <span>Balance: {isInvert ? balanceB : balanceA}</span>
                </div>
                <input className="line-exchange valForSwap" placeholder="Value" />
              </div>
              <svg
                viewBox="0 0 24 24"
                className="arrow"
                onClick={() => {
                  setIsInvert(!isInvert);
                }}
              >
                <path d="M16 17.01V11c0-.55-.45-1-1-1s-1 .45-1 1v6.01h-1.79c-.45 0-.67.54-.35.85l2.79 2.78c.2.19.51.19.71 0l2.79-2.78c.32-.31.09-.85-.35-.85H16zM8.65 3.35L5.86 6.14c-.32.31-.1.85.35.85H8V13c0 .55.45 1 1 1s1-.45 1-1V6.99h1.79c.45 0 .67-.54.35-.85L9.35 3.35a.501.501 0 00-.7 0z"></path>
              </svg>
              <div className="container-money">
                <div className="line-money">
                  <span className="coin">
                    {" "}
                    {isInvert ? tokenA.name : tokenB.name}
                  </span>
                  <span>Balance: {isInvert ? balanceA : balanceB}</span>
                </div>
                <input className="line-exchange" placeholder="Value" />
              </div>
            </div>
            <div className="validate" onClick={handleSwap}>
              Validate
            </div>
          </div>
        ) : (
          <>
            {whichWindow === 1 ? (
              <div className="container-events">
                <h2>Pool</h2>
                <div className="container-exchange">
                  <div className="container-money">
                    <div className="line-money">
                      <span className="coin">
                        {isInvert ? tokenB.name : tokenA.name}
                      </span>
                      <span>Balance: {isInvert ? balanceB : balanceA}</span>
                    </div>
                    <input
                      className="line-exchange valForLiquidity"
                      placeholder="Value"
                    />
                  </div>
                  <div className="container-money">
                    <div className="line-money">
                      <span className="coin">
                        {" "}
                        {isInvert ? tokenA.name : tokenB.name}
                      </span>
                      <span>Balance: {isInvert ? balanceA : balanceB}</span>
                    </div>
                    <input
                      className="line-exchange valForLiquidity"
                      placeholder="Value"
                    />
                  </div>
                  <div className="select-duration">
                    <div className="dur selected">1 month</div>
                    <div className="dur">3 months</div>
                    <div className="dur">6 months</div>
                  </div>
                </div>
                <div>Current Yield: -- %</div>
                <div>LP BTC/MASSA - balance: {nbLPToken}</div>
                <div>
                  <div className="validate" onClick={addLiquidity}>
                    Add liquidity
                  </div>
                  <div className="validate low">Remove liquidity</div>
                </div>
              </div>
            ) : (
              <div className="container-events option-limit">
                <h2>Options</h2>
                <div className="container-option">
                  <div className="container-twins">
                    <span>Coin</span>
                    <div className="container-coin selectOption">
                      <div className="selectCoin">MASSA</div>
                      <div className="chooseCoin">
                        <span>Bitcoin</span>
                      </div>
                    </div>
                  </div>
                  <div className="container-twins">
                    <span>Call / Put</span>
                    <div className="container-coin selectOption">
                      <div className="selectCoin">Call</div>
                      <div className="chooseCoin">
                        <span>Put</span>
                      </div>
                    </div>
                  </div>
                  <div className="container-twins">
                    <span>Strike Price</span>
                    <div className="dollardIn">
                      <input
                        className="selectPrice selectOption inputOption"
                        placeholder="100"
                      />
                      <div>$</div>
                    </div>
                  </div>
                  <div className="container-twins">
                    <span>Expiry Date</span>
                    <input
                      type="date"
                      className="selectPrice selectOption inputDate"
                    />
                  </div>
                  <div className="container-twins">
                    <span>Take Profit</span>
                    <div className="dollardIn">
                      <input
                        className="selectPrice selectOption inputOption"
                        placeholder="100"
                      />
                      <div>$</div>
                    </div>
                  </div>
                  <div className="container-twins">
                    <span>Stop Loss</span>
                    <div className="dollardIn">
                      <input
                        className="selectPrice selectOption inputOption"
                        placeholder="100"
                      />
                      <div>$</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div
                    className="validate"
                    // onClick={handleSubscribe}
                  >
                    Create Option
                  </div>
                  <div className="validate low">Execute option</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
