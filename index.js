let arrayWithAllData = [];

// Sample JSON data
const URL = "https://restcountries.eu/rest/v2/all";

//Schema for the table to be rendered
const schema = {
  columns: [
    {
      name: "name",
      sortable: true,
      sortOrder: 0,
    },
    {
      name: "alpha2Code",
      sortable: false,
      sortOrder: 0,
    },
    {
      name: "alpha3Code",
      sortable: false,
      sortOrder: 0,
    },
    {
      name: "region",
      sortable: true,
      sortOrder: 0,
    },
    {
      name: "population",
      sortable: true,
      sortOrder: 0,
    },
    {
      name: "capital",
      sortable: true,
      sortOrder: 0,
    },
    {
      name: "subregion",
      sortable: true,
      sortOrder: 0,
    },
  ],
};

//JSON data to populate table
async function getData() {
  try{
  let jsondata;
await fetch(URL)
    .then(function (data) {
      return data.json();
    })
    .then(function (json) {
      jsondata = json.slice(0, 40);
    })
    .catch((err)=>{
      console.log(err);
    });
  return jsondata;
  }
  catch(err){
    console.log("error in fetching data");
  }
}

//fetching the required columns and rows for populating table
async function getValidData() {
  try{
    let jsonData = await getData();
    let jsonFinalData = [];
    jsonData.forEach((element) => {
      objval = {};
      schema.columns.forEach((ele) => {
        if (ele.name in element) {
          objval[ele.name] = element[ele.name];
        }
      });
      jsonFinalData.push(objval);
    });
    return jsonFinalData;
  }
  catch(err)
  {
    console.log('some error has occured.please check logs');
    return;
  }
  
  
}

//populating the table dynamically by calling function to create table.
let orgTableBodyValue = tableval.querySelector("tbody");
let rowsOrginalTable = Array.from(orgTableBodyValue.rows);

//set the sorting order selected by user
function setSortOrder(sortObj) {
  for (let k in schema.columns) {
    if (schema.columns[k].name == sortObj["name"]) {
      return (schema.columns[k].sortOrder = sortObj["sortOrder"]);
    }
  }
}

//fetch the last sorting order from session storage once the page is refreshed
function fetchingLastSortOrder() {
  let lastsort = sessionStorage.getItem("lastsort");
  if (lastsort) {
    lastsort = JSON.parse(lastsort);
    if (!isNaN(parseInt(lastsort["colnum"]))) {
      sortGrid(lastsort["colnum"], lastsort["sortOrder"], lastsort["name"]);
      setSortOrder(lastsort);
    }
  }
}

//set table width
function changeTableWidth() {
  document.getElementById("filtertab").style.visibility = "visible";
  document.getElementById("tableval").style.visibility = "visible";
  document.getElementById("tableval").setAttribute("style", "width:70%");
  document.getElementById("tableval").setAttribute("float", "left");
  document.getElementById("maintable").setAttribute("style", "display:flex");
}

//function to fetch last filter applied by user
function fetchLastFilterApplied() {
  let filterChkbox = sessionStorage.getItem("checkboxes");
  let filterPane = sessionStorage.getItem("filterPaneVisibility");
  if (filterChkbox) {
    filterChkbox = filterChkbox.split(",");

    if (filterChkbox.length > 0) {
      filterChkbox.forEach((ele) => {
        document.getElementById(ele).checked = "checked";
      });

      filterComponent();
      if (filterPane == "visible") {
        changeTableWidth();
      }
    }
  }
}

try{
  getValidData().then((data) => {
    dynamicTable(schema, data);
    fetchingLastSortOrder();
    fetchLastFilterApplied();
  });
}
catch(err){
  console.log("Error in fetching data");
}


document.getElementById("close").addEventListener("click", function () {
  document.getElementById("filtertab").style.visibility = "hidden";
});

//event listener for filter component
document
  .getElementById("filtertab")
  .addEventListener("change", filterComponent);

document.getElementById("filter").addEventListener("click", function () {
  changeTableWidth();
});

// on click of the headers on table for sorting
tableval.onclick = function (e) {
  if (e.target.tagName != "TH") return;
  let th = e.target;
  let name = th.innerHTML;
  name = name.replace('<i class="fas fa-sort"></i>', "");
  var count;
  var sortable = true;

  for (let k in schema.columns) {
    if (schema.columns[k].name == name) {
      count = schema.columns[k].sortOrder;
      sortable = schema.columns[k].sortable;
    }
  }
  if (sortable) {
    if (count === 0 || count === 1) {
      count += 1;
    } else if (count === 2) {
      count = 0;
    }
    sortGrid(th.cellIndex, count, name);
    setSortOrder({ colnum: th.cellIndex, name: name, sortOrder: count });
  }
};

// sorting function-ASC-1,DESC-2 and nosort-0
function sortGrid(colNum, sortOrder, name) {
  try{
  let tbody = tableval.querySelector("tbody");
  let rowsArray = Array.from(orgTableBodyValue.rows);
  if (rowsArray.length == 0) {
    rowsArray = arrayWithAllData;
  }
  // compare(a, b) compares two rows, need for sorting
  let compare;

  switch (sortOrder) {
    case 2:
      compare = function (rowA, rowB) {
        if (isFinite(rowA.cells[colNum].innerHTML)) {
          return (
            Number(rowB.cells[colNum].innerHTML) -
            Number(rowA.cells[colNum].innerHTML)
          );
        } else {
          return rowA.cells[colNum].innerHTML < rowB.cells[colNum].innerHTML
            ? 1
            : -1;
        }
        //
      };
      break;
    case 1:
      compare = function (rowA, rowB) {
        if (isFinite(rowA.cells[colNum].innerHTML)) {
          return (
            Number(rowA.cells[colNum].innerHTML) -
            Number(rowB.cells[colNum].innerHTML)
          );
        } else {
          return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML
            ? 1
            : -1;
        }

        //return rowB.cells[colNum].innerHTML - rowA.cells[colNum].innerHTML;
      };
      break;
  }

  // sort
  rowsArray.sort(compare);
  if (sortOrder == 1 || sortOrder == 2) {
    tbody.append(...rowsArray);
  } else {
    if (rowsArray.length !== arrayWithAllData.length) {
      tbody.append(...rowsArray);
    } else {
      tbody.append(...arrayWithAllData);
    }
  }

  retriveobj = { colnum: colNum, name: name, sortOrder: sortOrder };

  sessionStorage.setItem("lastsort", JSON.stringify(retriveobj));
}
catch(err){
  console.log("Error in sorting");
}
}

//function to create dynamic table
function dynamicTable(schema, dataval) {
  try{
    let head = document.createElement("TR");
    schema.columns.forEach((ele) => {
      let tdval = document.createElement("TH");
      if (ele.sortable === true) {
        tdval.innerHTML = ele.name + '<i class="fas fa-sort"></i>';
      } else {
        tdval.innerHTML = ele.name;
      }
      head.appendChild(tdval);
    });
    document.getElementById("thead").appendChild(head);
  
    dataval.forEach((ele) => {
      let row = document.createElement("TR");
      Object.keys(ele).forEach((key, index) => {
        let tdval = document.createElement("TD");
        tdval.innerHTML = ele[key];
        row.appendChild(tdval);
      });
      document.getElementById("tbody").appendChild(row);
      arrayWithAllData.push(row);
    });
    document.getElementById("tableval").style.visibility = "visible";
  }
  catch(err)
  {
    console.log("ERROR");
  }
}

// filtercomponent functionality
function filterComponent() {
  try{
    let filterStateArray = [];
    let tbody = tableval.querySelector("tbody");
    let rowsArray = Array.from(tbody.rows);
    var newrowsarray = [];
    const checkboxes = document.querySelectorAll(
      'input[name="region"]:checked,input[name="subregion"]:checked'
    );
    if (checkboxes.length > 0) {
      let finalTableBody = [];
      checkboxes.forEach((checkbox) => {
        filterStateArray.push(checkbox.id);
        newrowsarray = arrayWithAllData.filter((ele) => {
          if (
            ele.childNodes[3].innerHTML == checkbox.value ||
            ele.childNodes[6].innerHTML == checkbox.value
          ) {
            return ele;
          }
        });
        finalTableBody = finalTableBody.concat(newrowsarray);
      });
  
      tbody.innerHTML = "";
      tbody.append(...finalTableBody);
    } else {
      tbody.innerHTML = "";
      tbody.append(...arrayWithAllData);
    }
    fetchingLastSortOrder();
    sessionStorage.setItem(
      "filterPaneVisibility",
      document.getElementById("filtertab").style.visibility
    );
    sessionStorage.setItem("checkboxes", filterStateArray);
  }
  catch(err){
    console.log("error in filter component");
  }
  
}
