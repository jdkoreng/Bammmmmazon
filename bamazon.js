var mysql = require("mysql");
var inquirer = require("inquirer");
var usersTotalPurchase = 0;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Goobis12",
  database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt({
      name: "wantToBuyStuff",
      type: "rawlist",
      message: "Would you like to [BUY] some stuff or [EXIT] ?",
      choices: ["BUY", "EXIT"]
    })
    .then(function (answer) {
      if (answer.wantToBuyStuff.toUpperCase() === "BUY") {
        buyStuff();
      }
      else {
        console.log('You purchased $' + usersTotalPurchase + ' worth of goods at my little shop');
        usersTotalPurchase = 0;

      }
    });
}



function buyStuff() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function () {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "What item would you like to buy?"
        },
        {
          name: "quantity",
          type: "input",
          message: "How many would you like to buy?"
        }
      ])
      .then(function (answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }
        if (chosenItem.stock_quantity > answer.quantity) {
          //  var stock_quantity = results.stock_quantity;
          // gbvhjghjbjhnkjnkjnkjnkjnkj
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: (chosenItem.stock_quantity - answer.quantity)
              },
              {
                id: chosenItem.id
              }
            ],
            function (error) {
              if (error) throw err;
              console.log("Bought stuff");
              start();
            }
          );

          //this query will total up the products the user has bought
          usersTotalPurchase = parseInt(usersTotalPurchase + (answer.quantity * chosenItem.price));
          console.log('Your purchase total so far is $' + usersTotalPurchase);
        }

        else {
          console.log('Not enough in stock');
          start();
        }




      });
  });
}