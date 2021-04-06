var logOut = document.getElementById("out");
logOut.addEventListener("click", function() {
    location.href = '/logOut';
});

addDropDown("opTimeBtn", "opTimeMenu", "opTimeIcon");
addDropDown("opAmBtn", "opAmMenu", "opAmIcon");
addDropDown("clTimeBtn", "clTimeMenu", "clTimeIcon");
addDropDown("clAmBtn", "clAmMenu", "clAmIcon");

addDropDown("addCatBtn", "addCatMenu", "addCatIcon");
addDropDown("removeCatBtn", "removeCatMenu", "removeCatIcon");
extractField("categoryTF", "removeCatMenu");
document.querySelector("#removeCatBtn").addEventListener("click", function() {
    extractField("categoryTF", "removeCatMenu");
});

addDropDown("addCityBtn", "addCityMenu", "addCityIcon");
addDropDown("removeCityBtn", "removeCityMenu", "removeCityIcon");
extractField("cityTf", "removeCityMenu");
document.querySelector("#removeCityBtn").addEventListener("click", function() {
    extractField("cityTf", "removeCityMenu");
});

extractCities();

var opHrBtns = document.getElementsByClassName('opHrBtn');
var clHrBtns = document.getElementsByClassName('clHrBtn');
var opHrField = document.getElementById('opTF');
var clHrField = document.getElementById('clTF');

for (var i=0; i<opHrBtns.length; i++) {
    opHrBtns[i].addEventListener('click', function() {
        var tfOgVal = opHrField.getAttribute('value');
        if (this.textContent[1]!=undefined) {
            opHrField.setAttribute('value', this.textContent+' '+tfOgVal.substring(3));
        } else {
            opHrField.setAttribute('value', this.textContent+'  '+tfOgVal.substring(3));
        }
    });
}

for (var i=0; i<clHrBtns.length; i++) {
    clHrBtns[i].addEventListener('click', function() {
        var tfOgVal = clHrField.getAttribute('value');
        if (this.textContent[1]!=undefined) {
            clHrField.setAttribute('value', this.textContent+' '+tfOgVal.substring(3));
        } else {
            clHrField.setAttribute('value', this.textContent+'  '+tfOgVal.substring(3));
        }
    });
}

function editTimeAP(tfId, val) {
    var tf = document.getElementById(tfId);
    var newTfVal = tf.getAttribute('value');
    if (newTfVal=="") {
        newTfVal = '   '+val
    } else {
        newTfVal = newTfVal.substring(0,3)+val;
    }
    tf.setAttribute('value', newTfVal);
}

function extractField(fieldId, menuId) {
    var field = document.getElementById(fieldId);
    var menu = document.getElementById(menuId);
    var tfVal = field.getAttribute('value');
    if (tfVal!=null&&tfVal!="") {
        var items = tfVal.trim().split(",");
        menu.innerHTML = "";
        for (var i=0; i<items.length; i++) {
            if (items[i].trim() != "") {
                var targetId = menuId.includes("Cat") ? generateCatTargetId(items[i]) : generateCityTargetId(items[i]);
                var rId = menuId.includes("Cat") ? "ca-rOP" : "ci-rOP";
                var newItem = document.createElement("button");
                newItem.setAttribute("type", "button");
                var funcParams = "('"+fieldId+"',"+"'"+rId+i+"',"+"'"+menuId+"'"+")";
                newItem.setAttribute("onclick", "removeFromField"+funcParams+"");
                newItem.setAttribute("id", rId + i);
                newItem.textContent = items[i];
                menu.appendChild(newItem);
                document.getElementById(targetId).disabled = true;
            }
        }
    }  
}

function extractCities() {
    var fieldContent = document.getElementById("cityTf").getAttribute("value");
    if (fieldContent!=null&&fieldContent.trim()!="") {
        var cityList = fieldContent.split(",");
        for (var i=0; i<cityList.length; i++) {
            if (cityList[i]!=null&&cityList[i].trim()!="") {
                addBranch(cityList[i]).value = document.getElementsByClassName('branchesData')[i].textContent;
            }
        }
    }
}

function removeFromField(fieldId, srcId, menuId) {
    var field = document.getElementById(fieldId);
    var clickSrc = document.getElementById(srcId);
    var tfVal = field.getAttribute('value');

    var delItem = clickSrc.textContent;

    var newTfVal="";
    if (tfVal!="") {
        newTfVal = tfVal.replace((delItem+","), "");
    }

    field.setAttribute('value', newTfVal);
    var targetId = menuId.includes("Cat") ? generateCatTargetId(delItem) : generateCityTargetId(clickSrc.textContent);
    document.getElementById(targetId).disabled = false;
    document.getElementById(menuId).removeChild(clickSrc);

    if (fieldId.includes("city")) {
        document.getElementById("branches").removeChild(document.getElementById(delItem));
    }
}

function addToField(fieldId, srcId) {
    var field = document.getElementById(fieldId);
    var clickSrc = document.getElementById(srcId);
    var tfVal = field.getAttribute('value');

    var newItem = clickSrc.textContent;

    var newVal="";
    if (tfVal=="") {
        newVal = newItem + ",";
    } else {
        newVal = tfVal + newItem + ",";
    }

    field.setAttribute('value', newVal);
    clickSrc.disabled = true;

    if (fieldId.includes("city")) {
        addBranch(newItem);
    }
}

function addBranch(newItem) {
    var newRow = document.createElement("div");
    newRow.classList.add("row");
    newRow.id = newItem;

    var newH3 = document.createElement("h3");
    newH3.textContent = newItem;

    var newField = document.createElement("input");
    newField.setAttribute("type", "text");
    newField.setAttribute("name", "branches");
    newField.setAttribute("placeholder", newItem + " Branch Location");
    newField.classList.add("tF");
    newField.required = true;

    newRow.appendChild(newH3);
    newRow.appendChild(newField);

    document.getElementById("branches").appendChild(newRow);
    return newField;
}

function generateCatTargetId(str) {
    switch (str) {
        case "Pizza":
            return "ca-aOP1";
        case "Chicken":
            return "ca-aOP2";
        case "Burger":
            return "ca-aOP3";
        case "Italian":
            return "ca-aOP4";
        case "Mexican":
            return "ca-aOP5";
        case "Chinese":
            return "ca-aOP6";     
        default:
            break;
    }
}

function generateCityTargetId(str) {
    switch (str) {
        case "Ramallah":
            return "ci-aOP1";
        case "Bethlehem":
            return "ci-aOP2";
        case "Hebron":
            return "ci-aOP3";
        case "Nablus":
            return "ci-aOP4";
        case "Jericho":
            return "ci-aOP5";
        case "Qalqilyah":
            return "ci-aOP6";     
        case "Tulkarm":
            return "ci-aOP7";   
        case "Jenin":
            return "ci-aOP8";     
        default:
            break;
    }
}
