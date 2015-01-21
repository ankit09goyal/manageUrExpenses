(function()
{
 "use strict";
 /*
   hook up event handlers 
 */
 function register_event_handlers()
 {
    
    
//     /* button  individual */
//    $(document).on("click", "#individual", function(evt)
//    {
//         activate_page("#createIndividualExpensePage"); 
//    });
//    
        /* button  backTohome */
    $(document).on("click", "#backTohome", function(evt)
    {
         activate_page_back("#mainpage"); 
    });
    
    
        /* button  View Expenses */
    $(document).on("click", "#viewExpenses", function(evt)
    {
//        createQueryOnExpenseListTable();
        if(localStorage.getItem("appStart")==1){
            //informing that startup is finished
            localStorage.setItem("appStart", 0);
        }
         activate_page("#expenseList"); 
    });
    
        /* listitem  expense_1 */
    $(document).on("click", "#expense_1", function(evt)
    {
         activate_page("#expenseListDetail"); 
    });
    
        /* button  addItemButton */
    $(document).on("click", "#addItemButton", function(evt)
    {
//         fillDropDownMenu();
         activate_page("#addExpenses"); 
    });
    
        /* button  backToExpenseList */
    $(document).on("click", "#backToExpenseList", function(evt)
    {
         createQueryOnExpenseListTable();
         activate_page_back("#expenseList"); 
    });
    
        /* button  backToHomeFromList */
    $(document).on("click", "#backToHomeFromList", function(evt)
    {
         activate_page_back("#mainpage"); 
    });
    
        /* button  createExpense */
    $(document).on("click", "#createExpense", function(evt)
    {
         activate_page("#createIndividualExpensePage"); 
    });
    
        /* button  backToHome */
    $(document).on("click", "#backToHome", function(evt)
    {
       activate_page_back("#mainpage"); 
    });
    
        /* button  backToIndividualExpenseList */
    $(document).on("click", "#backToIndividualExpenseList", function(evt)
    {
         activate_page_back("#expenseListDetail"); 
    });
    
         /* button  backToExpenseDetailPage */
    $(document).on("click", "#backToExpenseDetailPage", function(evt)
    {
         activate_page_back("#expenseListDetail"); 
    });
    
        /* button  createIndividualExpenseButton */
    $(document).on("click", "#createIndividualExpenseButton", function(evt)
    {
        if(localStorage.getItem("appStart")==1){
            localStorage.setItem("appStart", 0);    //informing that startup is finished
        }
        createNewExpenseList();
//        createQueryOnExpenseListTable();
//        activate_page("#expenseList");
    });
     
        /* button  createNewGroupExpenseList */
    $(document).on("click", "#createNewGroupExpenseList", function(evt)
    {
        if(localStorage.getItem("appStart")==1){
            localStorage.setItem("appStart", 0);    //informing that startup is finished
        }
        createNewGroupExpenseList();
    });
     
     /* button  addInputTextField */
    $(document).on("click", "#addInputTextField", function(evt)
    {
        addInputTextField();
    });
    
        /* button  addNewItemToListButton */
    $(document).on("click", "#addNewItemToListButton", function(evt)
    {
        addNewItem();
    });
     
     /* button  deleteExpenseList */
    $(document).on("click", "#deleteExpenseList", function(evt)
    {
        deleteExpenseList();
    });
     
       /* button  deleteExpenseDetailItem */
    $(document).on("click", "#deleteExpenseDetailItem", function(evt)
    {
        deleteExpenseDetailItem();
    });
     
      /* button  deleteGroupExpenseList */
    $(document).on("click", "#deleteGroupExpenseList", function(evt)
    {
        deleteGroupExpenseList();
    });
     
       /* button  deleteGroupExpense */
    $(document).on("click", "#deleteGroupExpenseButton", function(evt)
    {
        deleteGroupExpenseDetailItem();
    });
     
           /* button  statistics */
    $(document).on("click", "#stats", function(evt)
    {
        createQueryOnCategoryTable("findAll");
        activate_page("#statistics");
    });
     
            /* button  statistics clicked by ITEM */
    $(document).on("click", "#byItemButton", function(evt)
    {
        createQueryOnCategoryTable("findAll");
        activate_sub_page("page_80_6", "daySubPage", "upage-content content-area vertical-col left", "hidden upage-content vertical-col left");
    });
     
         /* button  statistics clicked by DATE */
    $(document).on("click", "#byDayButton", function(evt)
    {
        createQueryOnExpensesTable("findAllByDate");
        activate_sub_page("daySubPage", "page_80_6", "upage-content vertical-col left", "hidden upage-content content-area vertical-col left");
    });
     
         /* button  backToHomeFromGroupList */
    $(document).on("click", "#backToHomeFromGroupList", function(evt)
    {
       activate_page_back("#mainpage"); 
    });
     
         /* button  createGroupExpenseListButton */
    $(document).on("click", "#createGroupExpenseListButton", function(evt)
    {
        fillDropDownMenuUser();
        $('#newInputTextFieldDiv').empty();
        activate_page("#createGroupExpense"); 
    });
    
     
      /* button  backToGroupExpenseListButton */
    $(document).on("click", "#backToGroupExpenseListButton", function(evt)
    {
       activate_page_back("#groupExpenseList"); 
    });
     
     /* button  viewGroupExpensesButton */
    $(document).on("click", "#viewGroupExpensesButton", function(evt)
    {
        if(localStorage.getItem("appStart")==1){
            //informing that startup is finished
            localStorage.setItem("appStart", 0);
        }
       activate_page("#groupExpenseList"); 
    });
     
            /* button  goToAddGroupExpensePage */
    $(document).on("click", "#goToAddGroupExpensePage", function(evt)
    {
       fillPaidByAndPaidForDropDown();
       activate_page("#addGroupExpensesPage"); 
    });
     
    /* button  addGroupExpenseButton */
    $(document).on("click", "#addGroupExpenseButton", function(evt)
    {
       addGroupExpense();
    });
     
    /* button  backToGroupExpenseDetail */
    $(document).on("click", "#backToGroupExpenseDetail", function(evt)
    {
       activate_page_back("#groupExpenseDetail"); 
    });
     
     /* button  backToGroupExpenseList */
    $(document).on("click", "#backToGroupExpenseList", function(evt)
    {
        createQueryOnExpenseListTableNew("createGroupExpenseList");
        activate_page_back("#groupExpenseList"); 
    });
     
     /* button  groupStats */
    $(document).on("click", "#groupStats", function(evt)
    {
        activate_page("#groupStatisticsPage");
        displayResults();
    });
     
     /* button  backToGroupExpenseDetailFromStats */
    $(document).on("click", "#backToGroupExpenseDetailFromStats", function(evt)
    {
       activate_page_back("#groupExpenseDetail"); 
    });
     
    }
 document.addEventListener("app.Ready", register_event_handlers, false);
})();

 