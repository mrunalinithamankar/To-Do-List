//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Mrunalini:text@cluster0.2n7ju.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true})

const itemSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemSchema)

const item1 = new Item({
  name: "Welcome to your ToDo List!"
})

const item2 = new Item({
  name: "Hit the + button to add a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item.>"
})

const defaultItems = [item1, item2, item3]

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model("List", listSchema)

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

//const day = date.getDate();
  Item.find({}, function(err, foundItems){
    if(err){
      console.log(err)
    }else{
      if(foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err)
          }else{
            console.log("Successfully inserted")
          }
        })
        res.redirect("/")
      }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem
  const listName = req.body.list
  

  const item = new Item({
    name: itemName
  })

  //console.log(item)
 if(listName == "Today"){
    item.save()
    res.redirect("/")
   }else{
    List.findOne({name: listName}, function(err, foundList){
     if(err){
         console.log(err)
       }else{
          foundList.items.push(item)
          //console.log(foundList)
          foundList.save()
//         console.log(foundList.items)
          res.redirect("/" + listName)
       }
     })
   }
  
});

app.post("/delete", function(req,res){
  const checkedItemId = mongoose.Types.ObjectId(req.body.checkbox.trim())
  const listName = req.body.listName

  if(listName == "Today"){
    
    Item.findByIdAndDelete(checkedItemId, function(err){
    if(err){
      console.log(err)
    }else{
      console.log("Deleted")
      res.redirect("/")
    }
  
  })
}else{
  List.findOneAndUpdate({listName}, 
    {$pull: {items:{_id: checkedItemId}}},
    function(err, foundList){
      if(err){
        console.log(err)
      }else{
        res.redirect("/" + listName)
      }
    })
}
})

app.get("/:customListName", function(req,res){
  customListName = _.capitalize(req.params.customListName)
  //console.log(customListName)

  List.findOne({name: customListName}, function(err, foundList){
    if(err){
      console.log(err)
    }else{
      if (!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        })
      
        list.save()
        res.redirect("/" + customListName)
      }else{
        //console.log(foundList)

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })

  
  
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
