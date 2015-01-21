/*
 * Please see the included README.md file for license terms and conditions.
 */


//localStorage keys
//key - listItemID, value - ID of the list item clicked on expenses list page
//key - listItemToDeleteID, value - ID of the list item to be deleted
//key - expenseDetailItemToDeleteID, value - ID of the expense detail item to be delted
//key - groupListItemID, value - ID of the list item clicked on group expenses list page 
//key - groupListItemToDeleteID, value - ID of the group list item to be deleted
//key - groupExpenseDetailItemToDeleteID, value - ID of the group expense detail item to be delted
//key - lastInsertID, value - last inserted ID on any query

    var expenseList;
    var expenseListName;
    var groupExpenseListName;
    var totalAmount;
    var chart1;
    var chart2;
    var totalArray;
    var catName;
    var userNameListForGroup = [];
    var userNameAndIdMap = {};
    var userIDAndColorMap = {};
    var paidForIDArray = [];
    var inputFieldCounter=2;
    var paidByIDArray = [];
    var groupStatsMatrix = [[]];
    var memberIDArray = [];
    
    // Wait for Cordova to load
    //
    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is ready
    
    function onDeviceReady() {
        FastClick.attach(document.body);
        
        var db = window.openDatabase("manageExpenses", "1.0", "manageExpenses DB", 2000000);
        db.transaction(populateDB, errorCB, successCB);
        
        // bind to handler
        $(window).on('orientationchange', adapt_to_orientation);
//        adapt_to_orientation();
        //informing that startup has begun
        localStorage.setItem("appStart", 1);
        //create expense list in HTML
        createQueryOnExpenseListTable();
        //fill the drop down of expense cat
        fillDropDownMenu();
        //create group expense list in HTML
        createQueryOnExpenseListTableNew("createGroupExpenseList");
        //fill user name and id map
        createQueryOnUserTable("fillUserNameAndIDMap");
        
    }

    function adapt_to_orientation(){
        if (window.orientation == 0 || window.orientation == 180) {
            // portrait
            if($('#ChartDiv').hasClass("horizontal_orientation")){
                $('#ChartDiv').removeClass("horizontal_orientation");
                $('#ChartDiv').addClass("vertical_orientation");
                $('#ChartDivBar').removeClass("horizontal_orientation");
                $('#ChartDivBar').addClass("vertical_orientation");
            }
        }else if (window.orientation == 90 || window.orientation == -90) {
            // landscape
            if($('#ChartDiv').hasClass("vertical_orientation")){
                $('#ChartDiv').removeClass("vertical_orientation");
                $('#ChartDiv').addClass("horizontal_orientation");
                $('#ChartDivBar').removeClass("vertical_orientation");
                $('#ChartDivBar').addClass("horizontal_orientation");
            }
        }
        showPieChartCategoryWise();
    }

    //Populate the database 
    function populateDB(tx) {
        //USER
//        tx.executeSql('DROP TABLE IF EXISTS USER');
        tx.executeSql('CREATE TABLE IF NOT EXISTS USER (id INTEGER PRIMARY KEY AUTOINCREMENT, userName TEXT)');
//        tx.executeSql('INSERT INTO USER (userName) VALUES ("Ankit")');
        
        //EXPENSE_LIST
        //identifier 0 - indivdual, 1 - group
//        tx.executeSql('DROP TABLE IF EXISTS EXPENSE_LIST');
        tx.executeSql('CREATE TABLE IF NOT EXISTS EXPENSE_LIST (id INTEGER PRIMARY KEY AUTOINCREMENT, listName TEXT, status INTEGER, identifier INTEGER, date TEXT)');
        
        //CATEGORY
        tx.executeSql('DROP TABLE IF EXISTS CATEGORY');
        tx.executeSql('CREATE TABLE IF NOT EXISTS CATEGORY (id INTEGER PRIMARY KEY AUTOINCREMENT, catName TEXT)');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Food")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Liquor")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Cigarette")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Grocery")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Transport")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Insurance")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Party")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Restaurant")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Mobile")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Shopping")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Rent")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Installments")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Restaurant")');
        tx.executeSql('INSERT INTO CATEGORY (catName) VALUES ("Miscellaneous")');
        
        
        
        //USER_EXPENSES
//        tx.executeSql('DROP TABLE IF EXISTS USER_EXPENSES');
        tx.executeSql('CREATE TABLE IF NOT EXISTS USER_EXPENSES (userID INTEGER, expenseListID INTEGER)');
        
        //EXPENSES
        //paidForGroup: 0 not group, 1 group
//        tx.executeSql('DROP TABLE IF EXISTS EXPENSES');
        tx.executeSql('CREATE TABLE IF NOT EXISTS EXPENSES (id INTEGER PRIMARY KEY AUTOINCREMENT, expenseListID INTEGER, userID INTEGER, catID INTEGER, amount DOUBLE, date TEXT, paidForGroup INTEGER)');
        
        //PAID_FOR
//        tx.executeSql('DROP TABLE IF EXISTS PAID_FOR');
        tx.executeSql('CREATE TABLE IF NOT EXISTS PAID_FOR (expenseID INTEGER, paidForID INTEGER)');
    }

    // Transaction error callback
    //
    function errorCB(tx, err) {
        alert("Error processing SQL: "+err);
    }

    // Transaction success callback
    //
    function successCB() {
//        alert("success!");
    }

    //********************************
    //create new expense list
    //********************************

    function createNewExpenseList(){
        var db = window.openDatabase("manageExpenses", "1.0", "manageExpenses DB", 2000000);
        db.transaction(function(tx){newExpenseList(tx, 0, 1);}, errorCB, successCB);
    }

    //create new expense List
    //identifier 0 - indivdual, 1 - group
    function newExpenseList(tx, identifier, userID){
        var expenseListName = "";
        expenseListName = document.getElementById('expenseNameInput').value;
        
        if(expenseListName===null || expenseListName===""){
            document.getElementById("alertBoxCreateNewExpenseList").innerHTML = '<h3>Check!!</h3><p>You forgot to enter the list name!!</p><a href="index.html" data-role="button" data-rel="back" data-inline="true" data-mini="true">OK</a>';
            $("#linkDialogCreateNewExpenseList").click();
        }else{
            var currentTime = new Date();
            var status = 0;
            tx.executeSql('INSERT INTO EXPENSE_LIST (listName, status, identifier, date) VALUES (?,?,?,?)',[expenseListName, status, identifier, currentTime]);
            createQueryOnExpenseListTable();
            activate_page("#expenseList");
        }
    }

    //*******************************
    //**** Expense list view queries starts ****
    //*******************************

    //call the transaction on DB
    function createQueryOnExpenseListTable(){
        var db = window.openDatabase("manageExpenses", "1.0", "manageExpenses DB", 2000000);
        db.transaction(queryExpenseListTable, errorCB);
    }

    //load data from expenseList table to be displayed
    function queryExpenseListTable(tx) {
        tx.executeSql('SELECT * FROM EXPENSE_LIST WHERE identifier = ?', [0], loadExpenseListFromDatabase, errorCB);
        
    }

    //on success - create HTML elements to be inserted
    function loadExpenseListFromDatabase(tx, results){
        var i=0;
        var num_stud=results.rows.length;
        var expenseListDiv = document.getElementById('expenseListDiv');
        
        //clear the div before start
        while (expenseListDiv.firstChild) {
            expenseListDiv.removeChild(expenseListDiv.firstChild);
        }
        
        //if list is empty
        if(num_stud===0){
            var newDiv = document.createElement('li');
            var classAttribute = document.createAttribute("class");
            classAttribute.value = "widget uib_w_13";
            newDiv.setAttributeNode(classAttribute);
            var data_uib_Attribute = document.createAttribute("data-uib");
            data_uib_Attribute.value = "jquery_mobile/listitem";
            newDiv.setAttributeNode(data_uib_Attribute);
            var data_ver_attribute = document.createAttribute("data-ver");
            data_ver_attribute.value = "0";
            newDiv.setAttributeNode(data_ver_attribute);

            newDiv.innerHTML = '<a id="expenseInitial"><h2>Create New List</h2><p>There are no expense lists.<br/> You can create one using the button<br/> <strong>Create New Expense</strong> below.</p></a>';

            expenseListDiv.appendChild(newDiv);

            var appStart = localStorage.getItem("appStart");
            if(appStart!=1){
                refreshExpenseList();
            }
        }else{
            //add elements in div
            for(i=0;i<num_stud;i++)
            {    
                createQueryOnExpensesTable("calculateTotal", results.rows.item(i).id, results.rows.item(i).listName);
            }
        }
    }

    //call transaction on DB
    function createQueryOnExpensesTable(identifier, id, listName, counter, nrOfMembers){
        var memberIDTemp = listName;            //just not to get confused - groupStatsExpenses
        var upperIndex = counter;               //just not to get confused - groupStatsExpenses
        var db = window.openDatabase("manageExpenses", "1.0", "manageExpenses DB", 2000000);
        if(identifier == "calculateTotal"){
            db.transaction(function(tx){ queryExpensesTable(tx, id, listName);}, errorCB);
        }else if(identifier == "expensesDetailPage"){
            db.transaction(function(tx){ queryExpensesTableToLoadExpenseDetailPage(tx, id);}, errorCB);
        }else if(identifier == "insertNewItemInExpenses"){
            db.transaction(function(tx){ queryExpensesTableToAddNewItem(tx);}, errorCB);
        }else if(identifier == "deleteExpenseDetailItem"){
            db.transaction(function(tx){ queryExpensesTableToDeleteItem(tx, id);}, errorCB);
        }else if(identifier == "chartCatWise"){
            db.transaction(function(tx){ queryExpensesTableToFindChartData(tx, id, listName, counter);}, errorCB);
        }else if(identifier == "findAllByDate"){
            db.transaction(function(tx){ queryCategoryTableToFindAllByDate(tx);}, errorCB);
        }else if(identifier == "calculateTotalGroup"){
            db.transaction(function(tx){ queryGroupExpensesTable(tx, id, listName);}, errorCB);
        }else if(identifier == "groupExpensesDetailPage"){
            db.transaction(function(tx){ queryExpensesTableToLoadGroupExpenseDetailPage(tx, id);}, errorCB);
        }else if(identifier == "insertNewItemInGroupExpenses"){
            db.transaction(function(tx){ queryExpensesTableToAddNewItemInGroup(tx);}, errorCB);
        }else if(identifier == "deleteGroupExpenseDetailItem"){
            db.transaction(function(tx){ queryExpensesTableToDeleteGroupItem(tx, id);}, errorCB);
        }else if(identifier == "groupStatsExpenses"){
            db.transaction(function(tx){ queryExpensesTableByExpenseListIDMemberIDAndGroup(tx, id, memberIDTemp, upperIndex, nrOfMembers);}, errorCB);
        }else if(identifier == "groupStatsExpensesNotPaidForGroup"){
            db.transaction(function(tx){ queryExpensesTableByExpenseListIDMemberIDAndNotGroup(tx, id, memberIDTemp, upperIndex, nrOfMembers);}, errorCB);
        }
    }

    //load data from expenseList table to be displayed
    function queryExpensesTable(tx, id, listName) {
        tx.executeSql('SELECT * FROM EXPENSES WHERE expenseListID = ?', [id], function(tx, results){calculateTotalExpenseMade(tx, results, id, listName);}, errorCB);
    }

    function calculateTotalExpenseMade(tx, results, id, listName){
        var length = results.rows.length;
        var total=0;
        var i=0;
        for(i=0; i<length; i++){
            total += results.rows.item(i).amount; 
        }
         
        var expenseListDiv = document.getElementById('expenseListDiv');
        var newDiv = document.createElement('li');
        var classAttribute = document.createAttribute("class");
        classAttribute.value = "widget uib_w_13";
        newDiv.setAttributeNode(classAttribute);
        var data_uib_Attribute = document.createAttribute("data-uib");
        data_uib_Attribute.value = "jquery_mobile/listitem";
        newDiv.setAttributeNode(data_uib_Attribute);
        var data_ver_attribute = document.createAttribute("data-ver");
        data_ver_attribute.value = "0";
        newDiv.setAttributeNode(data_ver_attribute);
        
        newDiv.innerHTML = '<a id="expense_'+id+'"><h2>'+listName+'</h2><span class="ui-li-count">'+total+'</span></a><a href="#delete" data-rel="popup" data-position-to="window" data-transition="pop" id="deleteExpenseList_'+id+'">Delete</a>';
        
        expenseListDiv.appendChild(newDiv);
        
        var appStart = localStorage.getItem("appStart");
        if(appStart!=1){
            refreshExpenseList();
        }
        
        //add event listner to the list elements
        var elementID = "expense_"+id;
        var elementID_Delete = "deleteExpenseList_"+id;
        document.getElementById(elementID).addEventListener("click", loadExpenseDetail);
        document.getElementById(elementID_Delete).addEventListener("click", showExpenseListDeletePopup);
        
    }

    //save id to local storage and show delete popup
    function showExpenseListDeletePopup(){
        var elementID = this.id.split("_")[1];
        var ID = "#"+this.id;
        localStorage.setItem("listItemToDeleteID", elementID);
//        $(ID).click();
    }

    //refresh list view
    function refreshExpenseList(){
         $('#expenseListDiv').listview('refresh');
    }

    //*******************************
    //******* funtions for expense details page starts *******
    //*******************************

    //load expense detail page with content
    function loadExpenseDetail(){
        var elementID = this.id.split("_")[1];
        localStorage.setItem("listItemID", elementID);
        //get expense list name
        createQueryOnExpenseListTableNew("expensesDetailPage", elementID);
        //get expense details
        createQueryOnExpensesTable("expensesDetailPage", elementID);
    }

    //on DB
    function createQueryOnExpenseListTableNew(identifier, elementID){
        var db = window.openDatabase("manageExpenses", "1.0", "manageExpenses DB", 2000000);
        if(identifier == "expensesDetailPage"){
            db.transaction(function(tx){ queryExpenseListTableForName(tx, elementID);}, errorCB);
        }else if(identifier == "deleteExpenseList"){
            db.transaction(function(tx){ queryExpenseListTableToDeleteExpenseList(tx, elementID);}, errorCB);
        }else if(identifier == "createGroupExpenseList"){
            db.transaction(queryExpenseListTableForGroupExpenses, errorCB);
        }else if(identifier == "groupExpensesDetailPage"){
            db.transaction(function(tx){ queryExpenseListTableForGroupName(tx, elementID);}, errorCB);
        }else if(identifier == "deleteGroupExpenseList"){
            db.transaction(function(tx){ queryExpenseListTableToDeleteGroupExpenseList(tx, elementID);}, errorCB);
        }
    }

    //query
    function queryExpenseListTableForName(tx, elementID){
        tx.executeSql('SELECT * FROM EXPENSE_LIST WHERE id = ?', [elementID], onSuccessGetName, errorCB);
    }
    
    //on success
    function onSuccessGetName(tx, results){
        expenseListName = results.rows.item(0).listName;
    }

    //query table for expenses of a particular expenseID
    function queryExpensesTableToLoadExpenseDetailPage(tx, id){
        tx.executeSql('SELECT * FROM EXPENSES WHERE expenseListID = ? ORDER BY date DESC', [id], function(tx, results){onSuccessLoadPage(tx, results, id); }, errorCB);
    }

    //add the HTML elements in the page
    function onSuccessLoadPage(tx, results, id){
        var length = results.rows.length;
        var total=0;
        var i=0;
        var expenseDetailDiv = document.getElementById('expenseDetailDiv');
        for(i=0; i<length; i++){
            total += results.rows.item(i).amount; 
        }
        
        //add total amount spent
        document.getElementById('totalAmountSpent').innerHTML = '';
        if(total!==0){
            document.getElementById('totalAmountSpent').innerHTML = '<span class="ui-li-count">'+total+' spent</span>';
        }
        
        //add heading
        document.getElementById('expensesHeading').innerHTML = '';
        document.getElementById('expensesHeading').innerHTML = expenseListName;
        
        //clear the div before start
        while (expenseDetailDiv.firstChild) {
            expenseDetailDiv.removeChild(expenseDetailDiv.firstChild);
        }
        
        //add list elements
        if(length===0){
            $('#expenseDetailHintText').removeClass("hide");
        }else{
            $('#expenseDetailHintText').addClass("hide");
            for(i=0; i<length; i++){
            createQueryOnCategoryTable("expensesDetailPage", results.rows.item(i).catID, results.rows.item(i).id, results.rows.item(i).amount, results.rows.item(i).date);   
            }
        }
        
        //load the expenses detail page
        activate_page("#expenseListDetail");
    }
    
    //make transaction on DB
    function createQueryOnCategoryTable(identifier, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userName, paidForIDArrayLocal){
         var db = window.openDatabase("manageExpenses", "1.0", "manageExpenses DB", 2000000);
        if(identifier == "expensesDetailPage"){
            db.transaction(function(tx){ queryCategoryTable(tx, catID, expensesID, amount, date);}, errorCB);
        }else if(identifier == "fillDropDown"){
            db.transaction(function(tx){ queryCategoryTableForDropDown(tx);}, errorCB);
        }else if(identifier == "findAll"){
            db.transaction(function(tx){ queryCategoryTableToFindAll(tx);}, errorCB);
        }else if(identifier == "groupExpensesDetailPage"){
            db.transaction(function(tx){ queryCategoryTableForGroupExpenses(tx, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userName, paidForIDArrayLocal);}, errorCB);
        }
    }

    //query category table
    function queryCategoryTable(tx, catID, expensesID, amount, date){
        tx.executeSql('SELECT * FROM CATEGORY WHERE id = ?', [catID], function(tx, results){addListElementsExpenseDetail(tx, results, expensesID, amount, date);}, errorCB);
    }

    //add list elements in HTML
    function addListElementsExpenseDetail(tx, results, expensesID, amount, date){
        
        var expenseDetailDiv = document.getElementById('expenseDetailDiv');
//        var newDiv = document.createElement('div');
        var newDiv = document.createElement('li');
        var classAttribute = document.createAttribute("class");
        classAttribute.value = "widget uib_w_13";
        newDiv.setAttributeNode(classAttribute);
        var data_uib_Attribute = document.createAttribute("data-uib");
        data_uib_Attribute.value = "jquery_mobile/listitem";
        newDiv.setAttributeNode(data_uib_Attribute);
        var data_ver_attribute = document.createAttribute("data-ver");
        data_ver_attribute.value = "0";
        newDiv.setAttributeNode(data_ver_attribute);
        
        newDiv.innerHTML = '<a href="#" id="expenseDetails_'+expensesID+'><img src="jqm/images/icons-png/alert-black.png" class="ui-li-icon"><h2>'+results.rows.item(0).catName+'</h2><p>'+date+'</p><span class="ui-li-count">'+amount+'</span></a><a href= "#deleteExpenseItem" data-rel="popup" data-position-to="window" data-transition="pop" id="deleteExpenseItem_'+expensesID+'">Delete</a>';
                                
        expenseDetailDiv.appendChild(newDiv);
        refreshExpenseDetailList();
        
        //add even listners
        var expenseDetailToDeleteID = "deleteExpenseItem_"+expensesID;
        document.getElementById(expenseDetailToDeleteID).addEventListener("click", showExpenseDetailItemDeletePopup);
    }

    //save id to local storage and show delete popup
    function showExpenseDetailItemDeletePopup(){
        var elementID = this.id.split("_")[1];
        var ID = "#"+this.id;
        localStorage.setItem("expenseDetailItemToDeleteID", elementID);
//        $(ID).click();
    }

    function refreshExpenseDetailList(){
        $('#expenseDetailDiv').listview('refresh');
    }

    //*********************
    //adding a new expense item starts
    //**********************

    //fills the drop down with categories stored in database
    function fillDropDownMenu(){
        document.getElementById("alertBox").innerHTML = "";
        createQueryOnCategoryTable("fillDropDown");
    }

    //query
    function queryCategoryTableForDropDown(tx){
        tx.executeSql('SELECT * FROM CATEGORY', [], onSuccessFillDropDownList, errorCB);
    }
    
    //on success
    function onSuccessFillDropDownList(tx, results){
        var dropDown = document.getElementById("itemDropDown");
        var dropDownOptions;
        for(var i=0; i<results.rows.length; i++){
            dropDownOptions += '<option value="' + results.rows.item(i).id + '">' + results.rows.item(i).catName + '</option>';
        }
        dropDown.innerHTML = '<option value="0">Select Item</option>' + dropDownOptions;
        $('#categoryInput').empty();
        $('#categoryInput').append('<option value="0">Select Item</option>');
        $('#categoryInput').append(dropDownOptions);
//        $('#categoryInput').selectmenu("refresh");
    }

    //*************************
    //adding a new item to list starts    
    //*************************

    //add new item
    function addNewItem(){
        var errorMsg = "";
        var amount = document.getElementById("enteredAmount").value;
        var selectedValue = document.getElementById("itemDropDown").value;
        if(selectedValue==="0"){
            errorMsg = "Please select a category!<br/>";
        }if(amount===null || amount === ""){
            errorMsg += "Please enter an amount!<br/>";
        }if(isNaN(amount)){
            errorMsg += "Only numbers are allowed!";
        }
        
        if(errorMsg===null || errorMsg===""){
            createQueryOnExpensesTable("insertNewItemInExpenses");
        }else{
            document.getElementById("alertBox").innerHTML = '<h3>Check!!</h3><p>'+errorMsg+'</p><a href="index.html" data-role="button" data-rel="back" data-inline="true" data-mini="true">OK</a>';
            $("#linkDialog").click();
        }
    }

    //query INSERT
    function queryExpensesTableToAddNewItem(tx){
        var expenseListID = localStorage.getItem("listItemID");
        var catID = document.getElementById("itemDropDown").value;
        var amount = document.getElementById("enteredAmount").value;
        var currentTime = new Date();
        var currentTime2 = currentTime.toDateString();
        tx.executeSql('INSERT INTO EXPENSES (expenseListID, userID, catID, amount, date) VALUES (?,?,?,?,?)',[expenseListID, 1, catID, amount, currentTime2]);
        
        loadExpenseDetailPageAfterAddingNewData();
    }

    //load expense detail page
    function loadExpenseDetailPageAfterAddingNewData(){
        var elementID = localStorage.getItem("listItemID");
        //get expense list name
        createQueryOnExpenseListTableNew("expensesDetailPage", elementID);
        //get expense details
        createQueryOnExpensesTable("expensesDetailPage", elementID);
    }    


    function activate_page(pageID){
        $("body").pagecontainer("change", pageID, { transition: "slide" });
    }

    function activate_sub_page(pageIDToShow, pageIDToHide, showClass, hideClass){
        var hidePage = document.getElementById(pageIDToHide);
        if(hidePage.hasAttribute("class")){
            hidePage.setAttribute("class", hideClass);
        }else{
            var classAttribute = document.createAttribute("class");
            classAttribute.value = hideClass;
            hidePage.setAttributeNode(classAttribute);
        }
        
        var showPage = document.getElementById(pageIDToShow);
        if(showPage.hasAttribute("class")){
            showPage.setAttribute("class", showClass);  
        }else{
            var classAttribute2 = document.createAttribute("class");
            classAttribute2.value = showClass;
            showPage.setAttributeNode(classAttribute2);
        }
        
    }

    function activate_page_back(pageID){
        $("body").pagecontainer("change", pageID, { transition: "slide", reverse: "true" });
    }

    //***************************
    //delete the expense list item
    //***************************

    function deleteExpenseList(){
        var elementID = localStorage.getItem("listItemToDeleteID");
        createQueryOnExpenseListTableNew("deleteExpenseList", elementID);
    }

    //query
    function queryExpenseListTableToDeleteExpenseList(tx, elementID){
        tx.executeSql('DELETE FROM EXPENSES WHERE expenseListID = ?', [elementID]);
        tx.executeSql('DELETE FROM EXPENSE_LIST WHERE id = ?', [elementID]);
        createQueryOnExpenseListTable();
         activate_page("#expenseList"); 
    }

    //***************************
    //delete the expense detail item
    //***************************

    function deleteExpenseDetailItem(){
        var elementID = localStorage.getItem("expenseDetailItemToDeleteID");
        createQueryOnExpensesTable("deleteExpenseDetailItem", elementID);
    }

    //query
    function queryExpensesTableToDeleteItem(tx, elementID){
        tx.executeSql('DELETE FROM EXPENSES WHERE id = ?', [elementID]);
        loadExpenseDetailPageAfterAddingNewData();
    }

    //***************************
    //delete the group expense list item
    //***************************

    function deleteGroupExpenseList(){
        var elementID = localStorage.getItem("groupListItemToDeleteID");
        createQueryOnExpenseListTableNew("deleteGroupExpenseList", elementID);
    }

    //query
    function queryExpenseListTableToDeleteGroupExpenseList(tx, elementID){
        tx.executeSql('DELETE FROM USER_EXPENSES WHERE expenseListID = ?', [elementID]);
        tx.executeSql('SELECT * FROM EXPENSES WHERE expenseListID = ?', [elementID], function(tx, results){
            for(var i=0; i<results.rows.length; i++){
                var expenseID = results.rows.item(i).id;
                tx.executeSql('DELETE FROM PAID_FOR WHERE expenseID = ?', [expenseID]);
            }
        }, errorCB);
        tx.executeSql('DELETE FROM EXPENSES WHERE expenseListID = ?', [elementID]);
        tx.executeSql('DELETE FROM EXPENSE_LIST WHERE id = ?', [elementID]);
        createQueryOnExpenseListTableNew("createGroupExpenseList");
        activate_page("#groupExpenseList"); 
    }

    //***************************
    //delete the group expense detail item
    //***************************

    function deleteGroupExpenseDetailItem(){
        var elementID = localStorage.getItem("groupExpenseDetailItemToDeleteID");
        createQueryOnExpensesTable("deleteGroupExpenseDetailItem", elementID);
    }

    //query
    function queryExpensesTableToDeleteGroupItem(tx, elementID){
        tx.executeSql('DELETE FROM PAID_FOR WHERE expenseID = ?', [elementID]);
        tx.executeSql('DELETE FROM EXPENSES WHERE id = ?', [elementID]);
        loadGroupExpenseDetailPageAfterAddingNewData();
    }

    //***************************
    //show pie chart
    //***************************

    //query
    function queryCategoryTableToFindAll(tx){
        chartData = [];
        chart1 = new cfx.Chart();
        chart2 = new cfx.Chart();
        chart1.setGallery(cfx.Gallery.Pie);
        chart2.setGallery(cfx.Gallery.Gantt);
        
//        chart1.getView3D().setEnabled(true);
        tx.executeSql('SELECT * FROM CATEGORY', [], onSuccessGetCategories, errorCB);
        
    }

    //on success
    function onSuccessGetCategories(tx, results){
        var length2 = results.rows.length;
        var catIdList = [];
        catName = [];
        totalArray = [];
        totalAmount = 0;
        var chartListUl = document.getElementById('chartList');
        
        //clear the div before start
        while (chartListUl.firstChild) {
            chartListUl.removeChild(chartListUl.firstChild);
        }
        
        for(var i=0; i<length2; i++){
            catIdList[i] = results.rows.item(i).id;
            catName[i] = results.rows.item(i).catName;
            createQueryOnExpensesTable("chartCatWise", catIdList[i], catName[i], i);
        }
        
        
    }

    //query
    function queryExpensesTableToFindChartData(tx, catId, catName, counter){
        var expenseListID = localStorage.getItem("listItemID");
        tx.executeSql('SELECT * FROM EXPENSES WHERE expenseListID=?', [expenseListID],function(tx, results){ onSuccessGetTotalAmount(tx, results);}, errorCB);
        tx.executeSql('SELECT * FROM EXPENSES WHERE expenseListID=? AND catID=?', [expenseListID, catId],function(tx, results){ onSuccessGetChartData(tx, results, catName, counter);}, errorCB);
        
    }

    //success total amount
    function onSuccessGetTotalAmount(tx, results){
        totalAmount=0;
        for(var i=0; i<results.rows.length; i++){
            totalAmount += results.rows.item(i).amount;
        }
    }

    //success
    function onSuccessGetChartData(tx, results, cat, counter){
        var length2 = results.rows.length;
        var total = 0;
        var percentage = 0;
        var roundedPercentage = 0;
        for(var i=0; i<length2; i++){
            total += results.rows.item(i).amount;
        }
        
        totalArray[counter] = total;
        percentage = (total/totalAmount)*100;
        roundedPercentage = Math.round( percentage * 10 ) / 10;
        
        var assignClass = getClass(roundedPercentage);
        
        var chartListUl = document.getElementById('chartList');
        var newDiv = document.createElement('li');
        var classAttribute = document.createAttribute("class");
        classAttribute.value = "widget uib_w_13 "+assignClass;
        newDiv.setAttributeNode(classAttribute);
        var data_uib_Attribute = document.createAttribute("data-uib");
        data_uib_Attribute.value = "jquery_mobile/listitem";
        newDiv.setAttributeNode(data_uib_Attribute);
        var data_ver_attribute = document.createAttribute("data-ver");
        data_ver_attribute.value = "0";
        newDiv.setAttributeNode(data_ver_attribute);
    
        newDiv.innerHTML = '<img src="images/img/resized/'+cat+'.png"><h2>'+cat+'</h2><p>Total entries: '+length2+'</p><p>'+roundedPercentage+'% of total</p><span class="ui-li-count">'+total+'</span>';
                                
        chartListUl.appendChild(newDiv);
        refreshChartList();
    }

    function getClass(roundedPercentage){
        if(roundedPercentage===0){
           return "background_0";
        }else if(roundedPercentage>0 && roundedPercentage<=5){
            return "background_10";
        }else if(roundedPercentage>5 && roundedPercentage<=10){
            return "background_20";
        }else if(roundedPercentage>10 && roundedPercentage<=15){
            return "background_30";
        }else if(roundedPercentage>15 && roundedPercentage<=25){
            return "background_40";
        }else if(roundedPercentage>25 && roundedPercentage<=35){
            return "background_50";
        }else if(roundedPercentage>35){
            return "background_60";
        }
    }

    function refreshChartList(){
         $('#chartList').listview('refresh');
        showPieChartCategoryWise();
    }

    function showPieChartCategoryWise(){
        populateChart();
        
        var divHolder = document.getElementById('ChartDiv');
        var divHolderBar = document.getElementById('ChartDivBar');
        
         //clear the div before start
        while (divHolder.firstChild) {
            divHolder.removeChild(divHolder.firstChild);
        }
        while (divHolderBar.firstChild) {
            divHolderBar.removeChild(divHolderBar.firstChild);
        }
        
        chart1.create(divHolder);
        chart2.create(divHolderBar);
    }

    function populateChart() {
        var items = [{
            "Category": catName[0],
            "Total": totalArray[0]
        }, {
            "Category": catName[1],
            "Total": totalArray[1]
        }, {
            "Category": catName[2],
            "Total": totalArray[2]
        }, {
            "Category": catName[3],
            "Total": totalArray[3]
        }, {
            "Category": catName[4],
            "Total": totalArray[4]
        }, {
            "Category": catName[5],
            "Total": totalArray[5]
        }, {
            "Category": catName[6],
            "Total": totalArray[6]
        }, {
            "Category": catName[7],
            "Total": totalArray[7]
        }, {
            "Category": catName[8],
            "Total": totalArray[8]
        }, {
            "Category": catName[9],
            "Total": totalArray[9]
        }, {
            "Category": catName[10],
            "Total": totalArray[10]
        }, {
            "Category": catName[11],
            "Total": totalArray[11]
        }, {
            "Category": catName[12],
            "Total": totalArray[12]
        }, {
            "Category": catName[13],
            "Total": totalArray[13]
        }];

        chart1.setDataSource(items);
        chart2.setDataSource(items);
    }

    //*************************
    //show chart by date    
    //*************************

    //query
    function queryCategoryTableToFindAllByDate(tx){
        var expenseListID = localStorage.getItem("listItemID");
        tx.executeSql('SELECT * FROM EXPENSES WHERE expenseListID=? ORDER BY date DESC', [expenseListID],function(tx, results){ onSuccessGetTotalAmountByDate(tx, results);}, errorCB);
    }

    //success
    function onSuccessGetTotalAmountByDate(tx, results){
        var counter=0;
        var date = []; 
        var amountByDate = [];
        var totalEntries = [];
        var tempAmount = 0;
        var tempDate = results.rows.item(0).date;
        var tempTotalEntries=0;
        
        //get data
        for(var i=0; i<results.rows.length; i++){
            if(tempDate == results.rows.item(i).date){
                tempAmount+=results.rows.item(i).amount;
                tempTotalEntries++;
            }else{
                amountByDate[counter] = tempAmount;         //save amount in array
                tempAmount=0;                               //reset amount
                date[counter]=tempDate;                     //save date in array
                tempDate=results.rows.item(i).date;         //update date
                totalEntries[counter] = tempTotalEntries;   //total entries of that date
                tempTotalEntries=0;                             //reset total entries
                i--;                                        //decremnt i so as not to miss the value skipped
                counter++;
            }
        }
        
        //save last entry
        amountByDate[counter] = tempAmount;         //save amount in array
        date[counter]=tempDate;                     //save date in array
        totalEntries[counter] = tempTotalEntries;   //total entries of that date
        counter++;
        
        var chartListUl = document.getElementById('dayChartList');
        
         //clear the div before start
        while (chartListUl.firstChild) {
            chartListUl.removeChild(chartListUl.firstChild);
        }
        
        //add list elements
        for(var j=0; j<counter; j++){
            var newDiv = document.createElement('li');
            var classAttribute = document.createAttribute("class");
            classAttribute.value = "widget uib_w_13";
            newDiv.setAttributeNode(classAttribute);
            var data_uib_Attribute = document.createAttribute("data-uib");
            data_uib_Attribute.value = "jquery_mobile/listitem";
            newDiv.setAttributeNode(data_uib_Attribute);
            var data_ver_attribute = document.createAttribute("data-ver");
            data_ver_attribute.value = "0";
            newDiv.setAttributeNode(data_ver_attribute);

            newDiv.innerHTML = '<h2>'+date[j]+'</h2><p>Total entries: '+totalEntries[j]+'</p><span class="ui-li-count">'+amountByDate[j]+'</span>';

            chartListUl.appendChild(newDiv);
            refreshDateChartList();
        }
    }

    function refreshDateChartList(){
         $('#dayChartList').listview('refresh');
//        showPieChartCategoryWise();
    }


    //******************************
    //create group expense list
    //******************************
    
    //query
    function queryExpenseListTableForGroupExpenses(tx){
        tx.executeSql('SELECT * FROM EXPENSE_LIST WHERE identifier = ?', [1], loadGroupExpenseListFromDatabase, errorCB);
    }

    //success
    function loadGroupExpenseListFromDatabase(tx, results){
        var i=0;
        var num_stud=results.rows.length;
        var expenseListDiv = document.getElementById('groupExpenseListDiv');
        
        //clear the div before start
        while (expenseListDiv.firstChild) {
            expenseListDiv.removeChild(expenseListDiv.firstChild);
        }
        
        if(num_stud===0){
            $('#groupExpenseListHintText').removeClass("hide");
        }else{
            $('#groupExpenseListHintText').addClass("hide");
            //add elements in div
            for(i=0;i<num_stud;i++)
            {    
                createQueryOnExpensesTable("calculateTotalGroup", results.rows.item(i).id, results.rows.item(i).listName);
            }
        }
    }

    //query
    function queryGroupExpensesTable(tx, id, listName) {
        tx.executeSql('SELECT * FROM EXPENSES WHERE expenseListID = ?', [id], function(tx, results){calculateTotalGroupExpenseMade(tx, results, id, listName);}, errorCB);
    }

    function calculateTotalGroupExpenseMade(tx, results, id, listName){
        var length = results.rows.length;
        var total=0;
        var i=0;
        
        //calculate total
        for(i=0; i<length; i++){
            total += results.rows.item(i).amount; 
        }
         
        var expenseListDiv = document.getElementById('groupExpenseListDiv');
        var newDiv = document.createElement('li');
        var classAttribute = document.createAttribute("class");
        classAttribute.value = "widget uib_w_13";
        newDiv.setAttributeNode(classAttribute);
        var data_uib_Attribute = document.createAttribute("data-uib");
        data_uib_Attribute.value = "jquery_mobile/listitem";
        newDiv.setAttributeNode(data_uib_Attribute);
        var data_ver_attribute = document.createAttribute("data-ver");
        data_ver_attribute.value = "0";
        newDiv.setAttributeNode(data_ver_attribute);
        
        newDiv.innerHTML = '<a id="groupExpense_'+id+'"><h2>'+listName+'</h2><span class="ui-li-count">'+total+'</span></a><a href="#deleteGroup" data-rel="popup" data-position-to="window" data-transition="pop" id="deleteGroupExpenseList_'+id+'">Delete</a>';
        
        expenseListDiv.appendChild(newDiv);
        
        var appStart = localStorage.getItem("appStart");
        if(appStart!=1){
            refreshGroupExpenseList();
        }
        
        //add event listner to the list elements
        var elementID = "groupExpense_"+id;
        var elementID_Delete = "deleteGroupExpenseList_"+id;
        document.getElementById(elementID).addEventListener("click", loadGroupExpenseDetail);
        document.getElementById(elementID_Delete).addEventListener("click", showGroupExpenseListDeletePopup);
        
    }

    //save id to local storage and show delete popup
    function showGroupExpenseListDeletePopup(){
        var elementID = this.id.split("_")[1];
        var ID = "#"+this.id;
        localStorage.setItem("groupListItemToDeleteID", elementID);
    }

    //refresh list view
    function refreshGroupExpenseList(){
         $('#groupExpenseListDiv').listview('refresh');
    }

    //*******************************
    //group expense details page
    //*******************************

    //load expense detail page with content
    function loadGroupExpenseDetail(){
        var elementID = this.id.split("_")[1];
        localStorage.setItem("groupListItemID", elementID);
        localStorage.setItem("addSummaryGroupExpense", 1);
        
        //clear paidByArrayID
        while(paidByIDArray.length>0){
            paidByIDArray.pop();
        }
        
        //get expense list name
        createQueryOnExpenseListTableNew("groupExpensesDetailPage", elementID);
        
        //get expense details
        createQueryOnExpensesTable("groupExpensesDetailPage", elementID);
        
        //make stats matrix
        createGroupStatsPage();
    }

    //query
    function queryUserExpenseTableToGetUserIDsAndThenNames(tx, expenseListID){
        tx.executeSql('SELECT * FROM USER_EXPENSES WHERE expenseListID = ?', [expenseListID], function(tx, results){onSuccessCreateQueryTogetUserName(tx, results, "fillUserIDAndNameMap");}, errorCB);
    }

    //query
    function queryExpenseListTableForGroupName(tx, elementID){
        tx.executeSql('SELECT * FROM EXPENSE_LIST WHERE id = ?', [elementID], onSuccessGetGroupName, errorCB);
    }
    
    //on success
    function onSuccessGetGroupName(tx, results){
        groupExpenseListName = results.rows.item(0).listName;
    }

    //query - query table for expenses of a particular expenseID
    function queryExpensesTableToLoadGroupExpenseDetailPage(tx, id){
        tx.executeSql('SELECT * FROM EXPENSES WHERE expenseListID = ? ORDER BY date DESC', [id], function(tx, results){onSuccessLoadGroupPage(tx, results, id); }, errorCB);
    }

    //success - add the HTML elements in the page
    function onSuccessLoadGroupPage(tx, results, id){
        var length = results.rows.length;
        var total=0;
        var i=0;
        var expenseDetailDiv = document.getElementById('groupExpenseDetailDiv');

        var individualTotal = [];
        
        //calculate total
        for(i=0; i<length; i++){
            total += results.rows.item(i).amount; 
            var paidByID = results.rows.item(i).userID;
            if($.inArray(paidByID, paidByIDArray)==-1){
                paidByIDArray.push(paidByID);
            }
        }
        
        //calculate individual total
        for(var j=0; j<paidByIDArray.length; j++){
            var paidByIdTemp = paidByIDArray[j];
            var indivTotalTemp = 0;
            for(var k=0; k<length; k++){
                if(results.rows.item(k).userID == paidByIdTemp){
                    indivTotalTemp += results.rows.item(k).amount;
                }
            }
            individualTotal.push(indivTotalTemp);
        }
        
        //add total amount spent
        document.getElementById('totalGroupAmountSpent').innerHTML = '';
        if(total!==0){
            document.getElementById('totalGroupAmountSpent').innerHTML = '<span class="ui-li-count">'+total+' spent</span>';
        }
        
        //add heading
        document.getElementById('groupExpensesHeading').innerHTML = '';
        document.getElementById('groupExpensesHeading').innerHTML = groupExpenseListName;
        
        //clear the div before start
        while (expenseDetailDiv.firstChild) {
            expenseDetailDiv.removeChild(expenseDetailDiv.firstChild);
        }
        
        if(length===0){
            $('#groupExpensesDetailHintText').removeClass("hide");
        }else{
            $('#groupExpensesDetailHintText').addClass("hide");
            //add list elements
            for(i=0; i<length; i++){
                createQueryOnUserTable("getUserName", results.rows.item(i).userID, "", "", results.rows.item(i).catID, results.rows.item(i).id, results.rows.item(i).amount, results.rows.item(i).date, results.rows.item(i).userID, individualTotal, results.rows.item(i).paidForGroup);
            }
        }
        
        //load the expenses detail page
        activate_page("#groupExpenseDetail");
    }

    //make transaction on DB
    function createQueryOnUserTable(identifier, userID, userName, lastInsertExpenseListID, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup){
        var db = window.openDatabase("manageExpenses", "1.0", "manageExpenses DB", 2000000);
        var identifierForUserIDAndNameMap = userName;
        if(identifier == "getUserName"){
            db.transaction(function(tx){ queryUserTable(tx, userID, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup);}, errorCB);
        }else if(identifier == "createNewUser"){
            db.transaction(function(tx){ queryUserTableToCreateNewUser(tx, userName, lastInsertExpenseListID);}, errorCB);
        }else if(identifier == "fillDropDownUser"){
            db.transaction(function(tx){ queryUserTableToFillDropDown(tx);}, errorCB);
        }else if(identifier == "getUserNameForGivenID"){
            db.transaction(function(tx){ createQueryTogetUserNameOfGivenID(tx, userID, identifierForUserIDAndNameMap);}, errorCB);
        }else if(identifier == "fillUserNameAndIDMap"){
            db.transaction(function(tx){ createQueryToFillUserNameAndIDMap(tx);}, errorCB);
        }
    }

    //query - user table to fill user and id map
    function createQueryToFillUserNameAndIDMap(tx){
        tx.executeSql('SELECT * FROM USER', [], function(tx, results){onSuccessfillMapOfUserNameAndID(tx, results); }, errorCB);
    }

    //success - onSuccessfillMapOfUserNameAndID
    function onSuccessfillMapOfUserNameAndID(tx, results){
        for(var i=0; i<results.rows.length; i++){
            var key = "key_"+results.rows.item(i).id;
            userNameAndIdMap[key] = results.rows.item(i).userName;
            userIDAndColorMap[key] = getRandomColor();
        }
    }

    function getRandomColor() {
        var letters = '0123456789ABCD'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    //query - user table
    function queryUserTable(tx, userID, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup){
        tx.executeSql('SELECT * FROM USER WHERE id = ?', [userID], function(tx, results){onSuccessAddUserNameToList(tx, results, userID, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup); }, errorCB);
        
    }

    //success
    function onSuccessAddUserNameToList(tx, results, userID, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup){
        var userName = results.rows.item(0).userName;

        if(paidForGroup==1){
            createQueryOnCategoryTable("groupExpensesDetailPage", catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userName);   
        }else{
            createQueryOnPaidTable("getPaidForNames", catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userName);
        }
    }

    //query
    function queryCategoryTableForGroupExpenses(tx, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userNamePaidBy, paidForIDArrayLocal){
        tx.executeSql('SELECT * FROM CATEGORY WHERE id = ?', [catID], function(tx, results){addListElementsGroupExpenseDetail(tx, results, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userNamePaidBy, paidForIDArrayLocal);}, errorCB);
    }

    //success - add list elements in HTML
    function addListElementsGroupExpenseDetail(tx, results, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userNamePaidBy, paidForIDArrayLocal){
        var paidFor;
        if(paidForGroup==1){
            paidFor = "Group";
        }
        else{
            paidFor="";
            for(var i=0; i<paidForIDArrayLocal.length - 1; i++){
                var key = "key_"+paidForIDArrayLocal[i];
                paidFor += userNameAndIdMap[key]+", ";
            }
            var keyNew = "key_"+paidForIDArrayLocal[paidForIDArrayLocal.length-1];
            paidFor += userNameAndIdMap[keyNew];
        }
        
        var expenseDetailDivNew = document.getElementById('groupExpenseDetailDiv');
        
        //add summary
        var paraString="";
        var totalSpentSummary = 0;
        for(var l=0; l<paidByIDArray.length; l++){  
            var keySummary = "key_"+paidByIDArray[l];
            paraString += "<p><strong>By "+userNameAndIdMap[keySummary]+": </strong>"+individualAmountArray[l]+"</p>";
            totalSpentSummary+=individualAmountArray[l];
        }
        
        var addSummaryGroupExpense = localStorage.getItem("addSummaryGroupExpense");
        if(addSummaryGroupExpense == 1){
            localStorage.setItem("addSummaryGroupExpense", 0);
            var newDiv2 = document.createElement('li');
            var classAttribute2 = document.createAttribute("class");
            classAttribute2.value = "widget uib_w_13";
            newDiv2.setAttributeNode(classAttribute2);
            var data_uib_Attribute2 = document.createAttribute("data-uib");
            data_uib_Attribute2.value = "jquery_mobile/listitem";
            newDiv2.setAttributeNode(data_uib_Attribute2);
            var data_ver_attribute2 = document.createAttribute("data-ver");
            data_ver_attribute2.value = "0";
            newDiv2.setAttributeNode(data_ver_attribute2);
            var data_theme2 = document.createAttribute("data-theme");
            data_theme2.value = "b";
            newDiv2.setAttributeNode(data_theme2);
            newDiv2.innerHTML = '<a href="#" id="summary"><h2>Total Spent: '+totalSpentSummary+'</h2>'+paraString+'</a>';
            expenseDetailDivNew.appendChild(newDiv2);
            refreshGroupExpenseDetailList();
        }
        
        
        var newDiv = document.createElement('li');
        var classAttribute = document.createAttribute("class");
        classAttribute.value = "widget uib_w_13";
        newDiv.setAttributeNode(classAttribute);
        var data_uib_Attribute = document.createAttribute("data-uib");
        data_uib_Attribute.value = "jquery_mobile/listitem";
        newDiv.setAttributeNode(data_uib_Attribute);
        var data_ver_attribute = document.createAttribute("data-ver");
        data_ver_attribute.value = "0";
        newDiv.setAttributeNode(data_ver_attribute);
        
        var keyColor = "key_"+paidByUserID;
        if(paidForGroup==1){
            newDiv.innerHTML = '<a id="groupExpenseDetailsNew_'+expensesID+'"><h2 style="color:'+userIDAndColorMap[keyColor]+';">'+userNamePaidBy+'</h2><p>Spent on: '+results.rows.item(0).catName+' on '+date+'</p><p>Paid for: '+paidFor+'</p><span class="ui-li-count">'+amount+'</span></a><a href="#deleteGroupExpense" style="background-color:#333;" data-rel="popup" data-position-to="window" data-transition="pop" id="deleteGroupExpenseItemNew_'+expensesID+'">Delete</a>';
        }else{
            if(userNamePaidBy === paidFor){
            newDiv.innerHTML = '<a id="groupExpenseDetailsNew_'+expensesID+'"><h2 style="color:'+userIDAndColorMap[keyColor]+';">'+userNamePaidBy+'</h2><p>Spent on: '+results.rows.item(0).catName+' on '+date+'</p><p>Paid for: '+paidFor+'</p><span class="ui-li-count">'+amount+'</span></a><a href="#deleteGroupExpense" style="background-color:#aaa;" data-rel="popup" data-position-to="window" data-transition="pop" id="deleteGroupExpenseItemNew_'+expensesID+'">Delete</a>';
            }else{
                newDiv.innerHTML = '<a id="groupExpenseDetailsNew_'+expensesID+'"><h2 style="color:'+userIDAndColorMap[keyColor]+';">'+userNamePaidBy+'</h2><p>Spent on: '+results.rows.item(0).catName+' on '+date+'</p><p>Paid for: '+paidFor+'</p><span class="ui-li-count">'+amount+'</span></a><a href="#deleteGroupExpense" data-rel="popup" data-position-to="window" data-transition="pop" id="deleteGroupExpenseItemNew_'+expensesID+'">Delete</a>';
            }
            
        }
        
        expenseDetailDivNew.appendChild(newDiv);
        refreshGroupExpenseDetailList();
        
        //add even listners
        var expenseDetailToDeleteID = "deleteGroupExpenseItemNew_"+expensesID;
        document.getElementById(expenseDetailToDeleteID).addEventListener("click", showGroupExpenseDetailItemDeletePopup);
    }

    //save id to local storage and show delete popup
    function showGroupExpenseDetailItemDeletePopup(){
        var elementID = this.id.split("_")[1];
        var ID = "#"+this.id;
        localStorage.setItem("groupExpenseDetailItemToDeleteID", elementID);
    }

    function refreshGroupExpenseDetailList(){
        $('#groupExpenseDetailDiv').listview('refresh');
    }

    //make transaction on DB
    function createQueryOnPaidTable(identifier, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userName){
        var memberID = date;
        var upperIndex = paidByUserID;
        var nrOfMembers = individualAmountArray;
        var db = window.openDatabase("manageExpenses", "1.0", "manageExpenses DB", 2000000);
        if(identifier == "getPaidForNames"){
            db.transaction(function(tx){ queryPaidTable(tx, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userName);}, errorCB);
        }else if(identifier == "getPaidForIDs"){
            db.transaction(function(tx){ queryPaidTableToGetPaidForIds(tx, expensesID, amount, memberID, upperIndex, nrOfMembers);}, errorCB);
        }
    }

    //query - paid table
    function queryPaidTable(tx, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userName){
        tx.executeSql('SELECT * FROM PAID_FOR WHERE expenseID = ?', [expensesID], function(tx, results){letsAddUserNameToList(tx, results, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userName);}, errorCB);
    }

    //success
    function letsAddUserNameToList(tx, results, catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userName){
        var paidForIDArrayLocal = [];
        for(var i=0; i<results.rows.length; i++){
            paidForIDArrayLocal.push(results.rows.item(i).paidForID);
        }
        createQueryOnCategoryTable("groupExpensesDetailPage", catID, expensesID, amount, date, paidByUserID, individualAmountArray, paidForGroup, userName, paidForIDArrayLocal);   
    }

    //********************************
    //create new group expense list
    //********************************

    //addInputTextField
    function addInputTextField(){
        inputFieldCounter++;
        var div = document.getElementById('newInputTextFieldDiv');
        var newDiv = document.createElement('div');
        var classAttribute = document.createAttribute("class");
        classAttribute.value = "table-thing with-label widget uib_w_59 label-font-small input-text-small";
        newDiv.setAttributeNode(classAttribute);
        var data_uib_Attribute = document.createAttribute("data-uib");
        data_uib_Attribute.value = "jquery_mobile/input";
        newDiv.setAttributeNode(data_uib_Attribute);
        var data_ver_attribute = document.createAttribute("data-ver");
        data_ver_attribute.value = "0";
        newDiv.setAttributeNode(data_ver_attribute);
        
        newDiv.innerHTML = '<label class="narrow-control label-inline" for="newUser_'+inputFieldCounter+'">New Member</label><input class="wide-control" placeholder="Enter user name" type="text" data-mini="true" id="newUser_'+inputFieldCounter+'">';
        div.appendChild(newDiv);
    }

    //DB transaction
    function createNewGroupExpenseList(){
        var db = window.openDatabase("manageExpenses", "1.0", "manageExpenses DB", 2000000);
        db.transaction(function(tx){newGroupExpenseList(tx, 1);}, errorCB, successCB);
        
    }

    //query - create new group expense List
    //identifier 0 - indivdual, 1 - group
    function newGroupExpenseList(tx, identifier){
        var expenseListName = "";
        var errorMsg ="";
        var counter = 0;
        var selectedMemebersCount = 0;
        //check input fields
        for(var i=0; i<inputFieldCounter; i++){
            var tempUserID = 'newUser_' + (i+1);
            var userName = document.getElementById(tempUserID).value;               
            if(userName!==null && userName!==""){
                counter++;
            }
        }
        //check selected drop down
        selectedMemebersCount = $('#groupMembers option:selected').length;
        counter = counter + selectedMemebersCount;
        //check list name
        expenseListName = document.getElementById('groupExpenseListName').value;  
        
        if(expenseListName === null || expenseListName===""){
            errorMsg += "You forgot to enter the list Name!! <br/>";
        }if(counter<2){
            errorMsg += "In group list you need atleast 2 members!!";
        }
        
        if(errorMsg === null || errorMsg === ""){
            var currentTime = new Date();
            var status = 0;
            tx.executeSql('INSERT INTO EXPENSE_LIST (listName, status, identifier, date) VALUES (?,?,?,?)',[expenseListName, status, identifier, currentTime], onSuccessCreateUserAndUpdateUserExpenseList, errorCB);
            createQueryOnExpenseListTableNew("createGroupExpenseList");
            activate_page("#groupExpenseList");
        }else{
            document.getElementById("alertBoxCreateGroup").innerHTML = '<h3>Check!!</h3><p>'+errorMsg+'</p><a href="index.html" data-role="button" data-rel="back" data-inline="true" data-mini="true">OK</a>';
            $("#linkDialogCreateGroup").click();
        }
    }

    //success
    function onSuccessCreateUserAndUpdateUserExpenseList(tx, results){
        var lastInsertId = results.insertId;
        createUserAndAddInUserExpenseListTable(lastInsertId);
    }
    
    //add user and expense ID in table
    function createUserAndAddInUserExpenseListTable(lastInsertId){
        //getting users from input fields
        for(var i=0; i<inputFieldCounter; i++){
            var tempUserID = 'newUser_' + (i+1);
            var userName = document.getElementById(tempUserID).value;
            if(userName!==null && userName!==""){
                createQueryOnUserTable("createNewUser", 1, userName, lastInsertId);
            }
        }
        
        //get users from drop down
        var selectedUserIDArray = [];
        $('#groupMembers option:selected').each(function() {
            selectedUserIDArray.push($(this).val());
        });
        for(var j=0; j<selectedUserIDArray.length; j++){
            createQueryOnUserExpenseTable("insertInTable", selectedUserIDArray[j], lastInsertId);
        }
    }

    //query - user table
    function queryUserTableToCreateNewUser(tx, userName, lastInsertExpenseListID){
        tx.executeSql('INSERT INTO USER (userName) VALUES (?)',[userName], function(tx, results){addInUserExpenseTable(tx, results, lastInsertExpenseListID, userName);}, errorCB);
    }

    //success
    function addInUserExpenseTable(tx, results, lastInsertExpenseListID, userName){
        var lastInsertUserID = results.insertId;
        var key = "key_"+lastInsertUserID;
        userNameAndIdMap[key] = userName;
        userIDAndColorMap[key] = getRandomColor();
        createQueryOnUserExpenseTable("insertInTable", lastInsertUserID, lastInsertExpenseListID);
    }

    //DB transaction
    function createQueryOnUserExpenseTable(identifier, lastInsertUserID, lastInsertExpenseListID){
        var db = window.openDatabase("manageExpenses", "1.0", "manageExpenses DB", 2000000);
        var expenseListID = lastInsertUserID; //just so that not get confused in "getUserNamesInExpenseList"
        if(identifier == "insertInTable"){
            db.transaction(function(tx){ queryUserExpenseTable(tx, lastInsertUserID, lastInsertExpenseListID);}, errorCB);
        }else if(identifier == "getUserIDs"){
            db.transaction(function(tx){ queryUserExpenseTableToGetUserIDs(tx);}, errorCB);
        }else if(identifier == "getUserNamesInExpenseList"){
            db.transaction(function(tx){ queryUserExpenseTableToGetUserIDsAndThenNames(tx, expenseListID);}, errorCB);
        }else if(identifier == "getUserIDForExpenseListID"){
            db.transaction(function(tx){ queryUserExpenseTableToGetUserIDsForExpenseListID(tx, expenseListID);}, errorCB);
        }
    }    

    //query
    function queryUserExpenseTable(tx, lastInsertUserID, lastInsertExpenseListID){
        tx.executeSql('INSERT INTO USER_EXPENSES (userID, expenseListID) VALUES (?,?)',[lastInsertUserID, lastInsertExpenseListID]);
        inputFieldCounter = 2;
    }

    //*********************
    //fill user drop down in group list creation
    //**********************

    //fills the drop down with categories stored in database
    function fillDropDownMenuUser(){
        createQueryOnUserTable("fillDropDownUser");
    }

    //query
    function queryUserTableToFillDropDown(tx){
        tx.executeSql('SELECT * FROM USER', [], onSuccessFillDropDownListUser, errorCB);
    }
    
    //on success
    function onSuccessFillDropDownListUser(tx, results){
        var dropDownOptions;
        for(var i=0; i<results.rows.length; i++){
            dropDownOptions += '<option value="' + results.rows.item(i).id + '">' + results.rows.item(i).userName + '</option>';
        }
        $('#groupMembers').empty();
        $('#groupMembers').append(dropDownOptions);
        $("#groupMembers").selectmenu("refresh");
    }

    //*************************
    //adding a new item to group list    
    //*************************

    //add new item
    function addGroupExpense(){
        var errorMsg = "";
        var amount = document.getElementById("groupAmountInput").value;
        var selectedValuePaidBy = document.getElementById("paidBySelect").value;
        var category = document.getElementById("categoryInput").value;
        var multiSelectCount = 0;
        multiSelectCount = $('#paidForSelect option:selected').length;
        
        if(selectedValuePaidBy==="0"){
            errorMsg = "Please select who paid!<br/>";
        }if(amount===null || amount === ""){
            errorMsg += "Please enter an amount!<br/>";
        }if(isNaN(amount)){
            errorMsg += "Only numbers are allowed!<br/>";
        }if(category==="0"){
            errorMsg += "Please select a category!<br/>";
        }if(multiSelectCount===0){
            errorMsg += "Please select atleast one person for who you paid for!";
        }
        
        if(errorMsg===null || errorMsg===""){
            createQueryOnExpensesTable("insertNewItemInGroupExpenses");
        }else{
            document.getElementById("alertBoxGroup").innerHTML = '<h3>Check!!</h3><p>'+errorMsg+'</p><a href="index.html" data-role="button" data-rel="back" data-inline="true" data-mini="true">OK</a>';
            $("#linkDialogGroup").click();
        }
    }

    //query INSERT
    function queryExpensesTableToAddNewItemInGroup(tx){
        var expenseListID = localStorage.getItem("groupListItemID");
        var catID = document.getElementById("categoryInput").value;
        var amount = document.getElementById("groupAmountInput").value;
        var paidByID = document.getElementById("paidBySelect").value;
        var paidForIDArrayLocal = [];
        
        //get users from drop down
        $('#paidForSelect option:selected').each(function() {
            paidForIDArrayLocal.push($(this).val());
        });
        
        var currentTime = new Date();
        var currentTime2 = currentTime.toDateString();
        var group = "group";
        
        //not paid for the group
        if($.inArray(group, paidForIDArrayLocal)==-1){
            tx.executeSql('INSERT INTO EXPENSES (expenseListID, userID, catID, amount, date, paidForGroup) VALUES (?,?,?,?,?,?)',[expenseListID, paidByID, catID, amount, currentTime2, 0], function(tx, results){onSuccessGetLastInsertID(tx, results, paidForIDArrayLocal);}, errorCB);
        }
        
        //paid for the group
        else{
            tx.executeSql('INSERT INTO EXPENSES (expenseListID, userID, catID, amount, date, paidForGroup) VALUES (?,?,?,?,?,?)',[expenseListID, paidByID, catID, amount, currentTime2, 1]);
        }
        
        loadGroupExpenseDetailPageAfterAddingNewData();
    }

    //success - get last insertID of any inserting query
    function onSuccessGetLastInsertID(tx, results, paidForIDArrayLocal){
         //insert into user_expenses table
        var lastInsertExpensesID = results.insertId;    
        for(i=0; i<paidForIDArrayLocal.length; i++){
            tx.executeSql('INSERT INTO PAID_FOR (expenseID, paidForID) VALUES (?,?)', [lastInsertExpensesID, paidForIDArrayLocal[i]]);
        }
    }

    //load expense detail page
    function loadGroupExpenseDetailPageAfterAddingNewData(){
        var elementID = localStorage.getItem("groupListItemID");
        
        localStorage.setItem("addSummaryGroupExpense", 1);
        
        //clear paidByArrayID
        while(paidByIDArray.length>0){
            paidByIDArray.pop();
        }
        //get expense list name
        createQueryOnExpenseListTableNew("groupExpensesDetailPage", elementID);
        //get expense details
        createQueryOnExpensesTable("groupExpensesDetailPage", elementID);
        
        createGroupStatsPage();
    }    

    //*****************************
    //fill paid by and paid for drop down in group
    //*****************************

    //fill drop down
    function fillPaidByAndPaidForDropDown(){
        $('#paidBySelect').empty();
        $('#paidForSelect').empty();
        $('#paidBySelect').append('<option value="0">Select Paid By</option>');
        $('#paidForSelect').append('<option>Select Paid For</option>');
        $('#paidForSelect').append('<option value="group">Group</option>');
        createQueryOnUserExpenseTable("getUserIDs");
    }

    //query
    function queryUserExpenseTableToGetUserIDs(tx){
        var expenseListID = localStorage.getItem("groupListItemID");
        tx.executeSql('SELECT * FROM USER_EXPENSES WHERE expenseListID = ?', [expenseListID], function(tx, results){onSuccessCreateQueryTogetUserName(tx, results, "dropDown");}, errorCB);
    }
    
    //on success - query user table for username
    function onSuccessCreateQueryTogetUserName(tx, results, identifierForUserIDAndNameMap){
        for(var i=0; i<results.rows.length; i++){
            createQueryOnUserTable("getUserNameForGivenID", results.rows.item(i).userID, identifierForUserIDAndNameMap);
        }
    }
    
    //query - user table
    function createQueryTogetUserNameOfGivenID(tx, userID, identifierForUserIDAndNameMap){
        tx.executeSql('SELECT * FROM USER WHERE id = ?', [userID], function(tx, results){onSuccessFillPaidByPaidForDropDown(tx, results, identifierForUserIDAndNameMap);}, errorCB);
    }

    //success - fill drop down
    function onSuccessFillPaidByPaidForDropDown(tx, results, identifier){  
        if(identifier=="dropDown"){
            $('#paidBySelect').append('<option value="'+results.rows.item(0).id+'">'+results.rows.item(0).userName+'</option>');
            $('#paidForSelect').append('<option value="'+results.rows.item(0).id+'">'+results.rows.item(0).userName+'</option>');
            $("#paidForSelect").selectmenu("refresh");
            $("#paidBySelect").selectmenu("refresh");
        }
    }
    
    //*********************************
    //group statistics page
    //*********************************


    function createGroupStatsPage(){
//        var expenseListDiv = document.getElementById("groupStatsList");
        
        
        //get expenseListID
        var expenseListID = localStorage.getItem("groupListItemID");
        //query user_Expense table to get userIDs
        createQueryOnUserExpenseTable("getUserIDForExpenseListID", expenseListID);
        
    }
             
    //query
    function queryUserExpenseTableToGetUserIDsForExpenseListID(tx, expenseListID){
        tx.executeSql('SELECT * FROM USER_EXPENSES WHERE expenseListID = ?',[expenseListID], onSuccessGetUserIDs, errorCB);
    }

    //success
    function onSuccessGetUserIDs(tx, results){        
        var expenseListID = localStorage.getItem("groupListItemID");
        var nrOfMembers = results.rows.length;
        
        localStorage.setItem("nrOfMembers", nrOfMembers);
        //initialize matrix
        for(var j=0; j<nrOfMembers; j++){
            var tempArray = [];
            for(var k=0; k<nrOfMembers; k++){
                 tempArray.push(0);
            }
            groupStatsMatrix.push(tempArray);
        }
        
        //clear memberIDArray
        while(memberIDArray.length>0){
            memberIDArray.pop();
        }
        
        for(var i=0; i<nrOfMembers; i++){
            memberIDArray.push(results.rows.item(i).userID);
        }
        memberIDArray.sort();
        
        for(i=0; i<nrOfMembers; i++){
            createQueryOnExpensesTable("groupStatsExpenses", expenseListID, memberIDArray[i], i, nrOfMembers);
        }
    }
    
    //query - expense paid for group
    function queryExpensesTableByExpenseListIDMemberIDAndGroup(tx, expenseListID, memberID, upperIndex, nrOfMembers){
        tx.executeSql('SELECT * FROM EXPENSES WHERE expenseListID = ? AND userID = ? AND paidForGroup = ?',[expenseListID, memberID, 1], function(tx, results){onSuccessGetExpensesListIDMemberIDAndGroup(tx, results, memberID, upperIndex, nrOfMembers);}, errorCB);   
    }

    //success - expense paid for group
    function onSuccessGetExpensesListIDMemberIDAndGroup(tx, results, memberID, upperIndex, nrOfMembers){
        var amount=0;
        var expenseListID = localStorage.getItem("groupListItemID");
        for(var i=0; i<results.rows.length; i++){
            amount += results.rows.item(i).amount;
        }
        amount = amount/nrOfMembers;        //calculate amount paid for each person including himself
        for(i=0; i<nrOfMembers; i++){
            groupStatsMatrix[upperIndex][i] = amount;      //save in 2D array by adding on exisisting amount if any
        }
        
        //transaction - not paid for group
        createQueryOnExpensesTable("groupStatsExpensesNotPaidForGroup", expenseListID, memberID, upperIndex, nrOfMembers);
    }

    //query -not paid for group
    function queryExpensesTableByExpenseListIDMemberIDAndNotGroup(tx, expenseListID, memberID, upperIndex, nrOfMembers){
        tx.executeSql('SELECT * FROM EXPENSES WHERE expenseListID = ? AND userID = ? AND paidForGroup = ?',[expenseListID, memberID, 0], function(tx, results){onSuccessGetExpensesListIDMemberIDAndNotGroup(tx, results, memberID, upperIndex, nrOfMembers);}, errorCB);   
    }

    //success
    function onSuccessGetExpensesListIDMemberIDAndNotGroup(tx, results, memberID, upperIndex, nrOfMembers){
        var length = results.rows.length;
        for(var i=0; i<length; i++){
             var expensesID = results.rows.item(i).id;
             var amount = results.rows.item(i).amount; 

            //query paidFOr table for the given expense ID
            createQueryOnPaidTable("getPaidForIDs", "", expensesID, amount, memberID, upperIndex, nrOfMembers);
        }
        
    }

    //query
    function queryPaidTableToGetPaidForIds(tx, expensesID, amount, memberID, upperIndex, nrOfMembers){
         tx.executeSql('SELECT * FROM PAID_FOR WHERE expenseID = ?',[expensesID], function(tx, results){onSuccessGetPaidForIds(tx, results, expensesID, amount, memberID, upperIndex, nrOfMembers);}, errorCB);   
    }

    //success
    function onSuccessGetPaidForIds(tx, results, expensesID, amount, memberID, upperIndex, nrOfMembers){
        var nrOfPaidForMembers = results.rows.length;
        amount = amount/nrOfPaidForMembers;
        for(var i=0; i<nrOfPaidForMembers; i++){
            var indexOf2DArray = $.inArray(results.rows.item(i).paidForID, memberIDArray);
            groupStatsMatrix[upperIndex][indexOf2DArray] += amount;
        }
//        alert("nrOfMembers "+nrOfMembers);
//        displayResults(nrOfMembers);
    }

    function displayResults(){ 
        var nrOfMembers = localStorage.getItem("nrOfMembers");
        var expenseDetailDivNew = document.getElementById("groupStatsListUl");
        
        //add summary spent by
        var paraString="";
        var paraString2="";
        var totalSpentSummary = 0;
        
        //clear the div before start
        while (expenseDetailDivNew.firstChild) {
            expenseDetailDivNew.removeChild(expenseDetailDivNew.firstChild);
        }
        
        for(var l=0; l<nrOfMembers; l++){
            var totalAmountSpentTemp = 0;
            var totalActualSpent = 0;
            for(var i=0; i<nrOfMembers; i++){
                totalAmountSpentTemp += groupStatsMatrix[l][i];
                totalActualSpent += groupStatsMatrix[i][l];
            }
            var keySummary = "key_"+memberIDArray[l];
            paraString += "<p><strong>By "+userNameAndIdMap[keySummary]+": </strong>"+totalAmountSpentTemp+"</p>";
            paraString2 += "<p><strong>Of "+userNameAndIdMap[keySummary]+": </strong>"+totalActualSpent+"</p>";
            totalSpentSummary+=totalAmountSpentTemp;
        }
            
            
            var newDiv2 = document.createElement('li');
            var classAttribute2 = document.createAttribute("class");
            classAttribute2.value = "widget uib_w_13";
            newDiv2.setAttributeNode(classAttribute2);
            var data_uib_Attribute2 = document.createAttribute("data-uib");
            data_uib_Attribute2.value = "jquery_mobile/listitem";
            newDiv2.setAttributeNode(data_uib_Attribute2);
            var data_ver_attribute2 = document.createAttribute("data-ver");
            data_ver_attribute2.value = "0";
            newDiv2.setAttributeNode(data_ver_attribute2);
            var data_theme2 = document.createAttribute("data-theme");
            data_theme2.value = "a";
            newDiv2.setAttributeNode(data_theme2);
            newDiv2.innerHTML = '<a href="#" id="groupSummary"><h2>Spent By:</h2><p><strong>Total Spent: '+totalSpentSummary+'</strong></p>'+paraString+'</a>';
            expenseDetailDivNew.appendChild(newDiv2);
            refreshGroupExpenseStatsList();
        
        //add summary actual spent by        
            var newDiv = document.createElement('li');
            var classAttribute = document.createAttribute("class");
            classAttribute.value = "widget uib_w_13";
            newDiv.setAttributeNode(classAttribute);
            var data_uib_Attribute = document.createAttribute("data-uib");
            data_uib_Attribute.value = "jquery_mobile/listitem";
            newDiv.setAttributeNode(data_uib_Attribute);
            var data_ver_attribute = document.createAttribute("data-ver");
            data_ver_attribute.value = "0";
            newDiv.setAttributeNode(data_ver_attribute);
            var data_theme = document.createAttribute("data-theme");
            data_theme.value = "a";
            newDiv.setAttributeNode(data_theme);
            newDiv.innerHTML = '<a href="#" id="groupSummary2"><h2>Actual Expenses:</h2>'+paraString2+'</a>';
            expenseDetailDivNew.appendChild(newDiv);
            refreshGroupExpenseStatsList();
        
        //who gives whom
        var paraString3="";
        for(l=0; l<nrOfMembers-1; l++){
            var keySummaryPaidBy = "key_"+memberIDArray[l];
            for(var k=l+1; k<nrOfMembers; k++){
                var keySummaryPaidFor = "key_"+memberIDArray[k];
                paraString3+="<p><strong>"+userNameAndIdMap[keySummaryPaidBy]+"</strong> gets from <strong>"+userNameAndIdMap[keySummaryPaidFor]+"</strong>: <t/>"+(groupStatsMatrix[l][k] - groupStatsMatrix[k][l])+"</p>";
            }
        }
            var newDiv3 = document.createElement('li');
            var classAttribute3 = document.createAttribute("class");
            classAttribute3.value = "widget uib_w_13";
            newDiv3.setAttributeNode(classAttribute3);
            var data_uib_Attribute3 = document.createAttribute("data-uib");
            data_uib_Attribute3.value = "jquery_mobile/listitem";
            newDiv3.setAttributeNode(data_uib_Attribute3);
            var data_ver_attribute3 = document.createAttribute("data-ver");
            data_ver_attribute3.value = "0";
            newDiv3.setAttributeNode(data_ver_attribute3);
            var data_theme3 = document.createAttribute("data-theme");
            data_theme3.value = "a";
            newDiv3.setAttributeNode(data_theme3);
            newDiv3.innerHTML = '<a href="#" id="groupSummary3"><h2>Who gives Whom:</h2>'+paraString3+'</a>';
            expenseDetailDivNew.appendChild(newDiv3);
            refreshGroupExpenseStatsList();
        
    }

    function refreshGroupExpenseStatsList(){
        $('#groupStatsListUl').listview('refresh');
    }


//        nrOfMembers = 3;
//        var arrayOfMembersID[];
//        var arrayOfMembersNameAndIDMap[][];
//
//        sort(arrayOfMembersID).asc;     //sorting in ascending order to know the index of 2D array later
//
//        var array[nrOfMembers][nrOfMembers];
//
//        for(var i=0; i<nrOfMembers; i++){
//            var memeberID = arrayOfMembersID[i];
//            //query EXPENSES - paid by memberID in this expense list for group 
//            for(){
//                amount += results.rows.item(i).amount;    
//            }
//            amount = amount/nrOfMembers;    //calculate amount paid for each person including himself
//            for(var j=0; j<nrOfMembers; j++){
//                array[i][j] += amount;  //save in 2D array by adding on exisisting amount if any
//            }
//
//            //query EXPENSES - not paid for group by this fucker
//            for(){
//                var tempPaidForArray;
//                var expensesID = results.rows.item(i).id;
//                var amount2 = results.rows.item(i).amount; 
//
//                //query paidFOr table for the given expense ID
//                var nrOfMembersPaidFor = results.rows.length;
//                amount2 = amount2/nrOfMembersPaidFor;
//                for(){
//                    var indexOf2DArray = arrayOfMembersID.have(results.rows.item(i).paidForID);
//                    array[i][indexOf2DArray] += amount2;
//                }
//            }   

 //paidForGroup: 0 not group, 1 group
////        tx.executeSql('DROP TABLE IF EXISTS EXPENSES');
//        tx.executeSql('CREATE TABLE IF NOT EXISTS EXPENSES (id INTEGER PRIMARY KEY AUTOINCREMENT, expenseListID INTEGER, userID INTEGER, catID INTEGER, amount DOUBLE, date TEXT, paidForGroup INTEGER)');
//        
//        //PAID_FOR
////        tx.executeSql('DROP TABLE IF EXISTS PAID_FOR');
//        tx.executeSql('CREATE TABLE IF NOT EXISTS PAID_FOR (expenseID INTEGER, paidForID INTEGER)');