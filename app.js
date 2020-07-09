//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const ejs = require("ejs");
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true , useUnifiedTopology: true,  useFindAndModify: false});

mongoose.connect("mongodb+srv://admin-aanchal:Test123@cluster0.up3jb.mongodb.net/todolistDB", {useNewUrlParser:true , useUnifiedTopology: true,  useFindAndModify: false});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema); //Item is model name

const item1 = new Item ({            //item 1,2,3 are document
  name : "Welcome to your todolist."
});

const item2 = new Item ({
  name : "Hit the + botton to enter a new item."
});

const item3 = new Item ({
  name : "<-- Hit this to delete a item."
});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];
// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Successfully saved default items to database.")
//   }
// });


app.get("/", function(req, res) {

//const day = date.getDate();
  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to database.")
        }
      });
      //res.render("list", {listTitle: "Today", newListItems: foundItems});
                //or
      res.redirect("/");
    }

    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    // res.render("list", {listTitle: "Today", newListItems: foundItems});
  });
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  
  // const list = new List({
  //   name: customListName,
  //   items: defaultItems 
  // });

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create new list
        const list = new List({
          name: customListName,
          items: defaultItems 
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //show an existing list
        //here list is list.ejs
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

      }
    }
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


  // const item = req.body.newItem;
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  //console.log(req.body.checkbox); -->(gives id on console)

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted the checked item");
        res.redirect("/");
      }
    });
  }

  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundResults){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
