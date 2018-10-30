var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIcome) {
        
        if(totalIcome > 0){
            this.percentage = Math.round((this.value/totalIcome)*100);
        } else {
            this.percentage = -1;
        }
    }
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItens[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totais[type] = sum;
    };   
    
    var data = {
        allItens: {
            exp: [],
            inc: []
        },
        totais: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
      
        addItem: function(tp, des, val) {
            var newItem, ID;
            
            if (data.allItens[tp].length > 0){
                ID = data.allItens[tp][data.allItens[tp].length -1].id + 1;
            } else {
                ID = 0;
            }
            
            if(tp === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (tp === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            
            data.allItens[tp].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function(type, itemID){
          
            var index = data.allItens[type].map(function(e) { return e.id; }).indexOf(itemID);
            
            if(index !== -1){
                data.allItens[type].splice(index,1);
            }
            
        },        
        
        calculateBudget: function(){
            calculateTotal('inc');
            calculateTotal('exp');
            data.budget = data.totais.inc - data.totais.exp;
            
            if(data.totais.inc > 0){
                data.percentage = Math.round((data.totais.exp/data.totais.inc)*100);
            } else {
                data.percentage = -1;
            }
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totais.inc,
                totalExp: data.totais.exp,
                percentage: data.percentage
            }
        },
        
        calcPercentage: function(){
            
            data.allItens.exp.forEach(function(curr){
                curr.calcPercentage(data.totais.inc);
            });
        },
        
        getPercentage: function(){
            return data.allItens.exp.map(function(el){ return el.percentage;});
        }        
    };    
    
})();

var UIController = (function(){
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budget: '.budget__value',
        income: '.budget__income--value',
        expense: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        titleDate: '.budget__title--month'
    };
    
    var formatNumberType =  function(num, type){
            
        var int, i, newNum;

        num = Math.abs(num);
        num = num.toFixed(2);

        int = num.split('.')[0];
        i = int.length;
        newNum = '';
        while(i > 3){
            newNum = ',' + int.substr(i-3,3) + newNum;
            i = i - 3;
        }

        if(i > 0){
            newNum = int.substr(0,i) + newNum;
        }

        newNum = newNum + '.' +num.split('.')[1];

        if(type === 'exp'){
            newNum = '- '+ newNum;
        }else if (type === 'inc'){
            newNum = '+ '+newNum;
        }

        return newNum;
    };
    
    var nodeListForEach = function(list, callBackFunction){
        for(var i = 0; i < list.length; i++){
            callBackFunction(list[i],i);
        }
    };
    
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        getDOMStrings: DOMStrings,
        
        addItem: function(item, type){
            var html, newHTML, element;
            // Create HTML string
            if (type === 'inc'){   
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> ' +
                            '<div class="item__description">%description%</div>' +
                            '<div class="right clearfix">' +
                                '<div class="item__value">%value%</div>' +
                                '<div class="item__delete">' +
                                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
            } else if(type === 'exp'){
                element = DOMStrings.expenseContainer;
                html = ' <div class="item clearfix" id="exp-%id%">' +
                            '<div class="item__description">%description%</div>' +
                            '<div class="right clearfix">' +
                               ' <div class="item__value">%value%</div>' +
                               ' <div class="item__percentage">21%</div>' +
                                '<div class="item__delete">' +
                                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                               ' </div>' +
                            '</div>' +
                        '</div>';
            }
            
            newHTML = html.replace('%id%',item.id);
            newHTML = newHTML.replace('%description%',item.description);
            newHTML = newHTML.replace('%value%',this.formatNumber(item.value,type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
            
        },
        
        deleteItem: function(item){
          
            var el = document.getElementById(item);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function() {
            var fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            
            var arrayFields = Array.prototype.slice.call(fields);
            
            arrayFields.forEach(function(cur, idx, arr){
                cur.value = "";
            });
            
            arrayFields[0].focus();
        },
        
        updateBudget: function(obj){
            document.querySelector(DOMStrings.budget).textContent = this.formatNumber(obj.budget);
            document.querySelector(DOMStrings.income).textContent = this.formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expense).textContent = this.formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentage).textContent = '---';
            }
            
        },
        
        updatePercentages: function(percentages){
            
            console.log('---------');
            console.log(percentages);
            
            var fields = document.querySelectorAll(DOMStrings.expPercentageLabel);
            
            nodeListForEach(fields, function(cur, idx){
                
                var per =  percentages[idx];
                
                if(per > 0){
                    cur.textContent = per + '%';
                } else {
                    cur.textContent = '---';
                }
                
            });
        },
        
        formatNumber: function(num, type){
            
            if(type){
                return formatNumberType(num,type);
            } else {
                if(num < 0){
                    return formatNumberType(num,'exp');
                }else {
                    return formatNumberType(num,'inc');
                } 
            }
        },
        
        updateDateTitle: function(){
            var date, year, month, months;
            
            date = new Date();
            
            year = date.getFullYear();
            month = date.getMonth() + 1;
            months = ['January','February','March','April','May','June','July', 'August','September','Octuber','November','December'];
            
            document.querySelector(DOMStrings.titleDate).textContent = months[month] + ' ' + year;            
        },
        
        changedType: function(){
            
            var nodes = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputValue + ',' +
                DOMStrings.inputDescription
            );
            
            nodeListForEach(nodes, function(curr){
                curr.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.addBtn).classList.toggle('red');
            
        }
        
        
    };
    
})();

var Controller = (function(budgetCtrl, UICtrl){
    
    var addEventListener = function() {
        DOM = UICtrl.getDOMStrings;   
    
        document.querySelector(DOM.addBtn).addEventListener('click',crtlAddItem);
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                crtlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click',crtlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };
    
    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return Budget
        var budget = budgetCtrl.getBudget();
        // 3. Display budget in the UI
        UICtrl.updateBudget(budget);
    }
    
    var updatePercentage = function(){
        
        budgetCtrl.calcPercentage();
        
        var percentage = budgetCtrl.getPercentage();
        
        UICtrl.updatePercentages(percentage);        
    }
    
    var crtlAddItem = function(){
        // 1. Get filed input data
        var input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add Item to budgetController
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add Item to the UI
            UICtrl.addItem(newItem,input.type);
            

            //4. Update Budget
            updateBudget(); 
            updatePercentage();
        }
        
        UICtrl.clearFields();

    };
    
    var crtlDeleteItem = function(event) {
      
        var itemID, splitID, id, type;
                
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID){
            
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            
            // delete from the data structure
            budgetCtrl.deleteItem(type,id);
            
            // delete from the DOM
            UICtrl.deleteItem(itemID);
            
            // update budget
            updateBudget(); 
            updatePercentage();
        }
        
    };

    return {
        init: function(){
            console.log('Ini');
            UICtrl.updateDateTitle();
            UICtrl.updateBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            addEventListener();
        }
    }
    
})(budgetController, UIController);

Controller.init();