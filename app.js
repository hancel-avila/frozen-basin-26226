
// BUDGET CONTROLLER
// Makes calculus
var budgetController = (function() {
    // Function constructors to create objects and store the data 
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;  
        this.percentage = -1; 
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) { // STEP.25 ---------------
        if (totalIncome > 0) {
            this.percentage = Math.round ((this.value / totalIncome) * 100);      
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() { // STEP.26 ---------------
        return this.percentage;
    };
    
     var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
     };

    var calculateTotal = function(type) { // STEP.14 ---------------

        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value; // 'Value' refers to the this.value inhereted from the function constructor where we stored the value
        });
        data.totals[type] = sum;
    };
    
    
    //Global Data Structure (container): Arrays to store the data instances (objects)
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },    
        budget: 0,
        percentage: -1 // -1 is usually a value to say that something is nonexistent, so if there are no values and no total expenses on incomes, there cannont exist a percentage.
    };
    
    // Public method that's gonna allow other modules to add a new item into our data structure  
    return { // We return an object which is going to contain all of our public methods also we return a testing function 
        addItem: function(type, des, val) { // STEP.6 Add a new item and push it in the object (data) container ---------------
            
            // In order to create a new item, first we would have to know the type: income/expense
            var newItem, ID;
            
            // [1 2 3 4 5], next ID = 6
            // [1 2 4 6 8], next ID = 9
            // Last ID + 1
            
            //Create new ID 
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;    
            }
            else {
                ID = 0; 
            }
            
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') { 
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        
        deleteItem: function(type, id) {// STEP.21 --------------- Delete item from the budgetCtrl
            var ids, index;
            // id = 6
            // ids = [1 2 4 6 8]
            // index = 3
            
            ids = data.allItems[type].map(function(current) { // 'Map' creates a copy of the array
               return current.id; //It's going to return the value on the array (6). If we return v.gr. '2', it will returns an array like [2 2 2 2 2]                
            });
            
            index = ids.indexOf(id); //IndexOf method returns the index of the array that we put on (). If 'id' is 6, then the index would be 3.
            
            if (index !== -1) { //If the index was not found or non-existen it returns -1
                data.allItems[type].splice(index, 1);
                //splice is used to remove elements, slice is used to create a copy
            }
        },
        
        
        calculateBudget: function () { // STEP.13 ---------------
            
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');            
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round ((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1; // -1 is nonexistent
            }            
        },  // Inc  -> 100%
            // Exp  ->  x        
        
        
        calculatePercentages: function() { // STEP.27 ---------------
            
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
             data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc); 
             });            
        },
        
         
        getPercentages: function() { // STEP.28 ---------------
            var allPerc = data.allItems.exp.map(function(cur) {
               return cur.getPercentage();
            });
            return allPerc;
        },
        
        
        getBudget: function() { // STEP.16 ---------------
          return {
              budget: data.budget,
              totalInc: data.totals.inc, 
              totalExp: data.totals.exp,
              percentage: data.percentage
          };
        },
        
        testing: function() {
            console.log (data);
        }
    };
    
})();


// UI CONTROLLER
// Obtains data from us
var UIController = (function() {
            
    // DOMstrings to store all the variables
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) { // STEP.33 Add sign before the number, and separate digits with comma ---------------
                var numSplit, int, dec; 

                num = Math.abs(num); // If number is negative, it removes the sign: -4 -> 4
                num = num.toFixed(2); // Only 2 decimals

                numSplit = num.split('.');

                int = numSplit[0]; // STEP.34 ---------------
                if (int.length > 3) {
                    int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input: 25310, output: 25,310
                };

                dec = numSplit[1];

                return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; // Since the ternary operator is an operator, we can wrap it into parentheses to be ejecuted first.
            };
    
    var nodeListForEach = function(list, callback) { // STEP.40 Our ForEach function constructor was put outside still as a private function so it can be called by other functions ---------------
               for (var i = 0; i <list.length; i++) {
                    callback(list[i], i ); // function(current, index)
                    
                }                             
            };

    return {  // STEP.4 Get the HTML input values from user ---------------     
        getInput: function() {           
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };             
        },
        
        addListItem: function (obj, type) { // Inserts the item on the DOM
            var html, newHtml, element;
            
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;    
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="close-circle-outline"></ion-icon></button></div></div></div>';            
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="close-circle-outline"></ion-icon></button></div></div></div>'; 
            }
                    
            // Replace the placeholder text with some actual data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));  // STEP.35 We print the value with the format ('sign, integer, 2 decimals' -> + 12,345.67 ) ---------------
            
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);            
        },
        
        
        deleteListItem: function(selectorID) { // STEP.23 ---------------
            var el = document.getElementById(selectorID); 
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() { // STEP.9 --------------- Clear fields
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue); // querySelectorAll syntax is CSS selector (that's why we use a comma), also it returns a NodeList and the info cannot be treated as an array
            
            fieldsArr = Array.prototype.slice.call(fields); /* With slice method we receive a copy and convert the list to an array
             The slice method is inhereted from the function constructor, from array's prototype.
             We have to call the slice method using the call method and passing the fields variable into it so that it becomes the THIS variable. This will trick the slice method into thinking that we give it an array, and it will return an array. */
            
            fieldsArr.forEach(function(current, index, array) { // We apply a callback function into forEach method, and this callback will be applied into each element of the array.
                current.value = ''; // <-- HTML value will be cleared
                
            });
            
            fieldsArr[0].focus(); // It will select the first element of the array (inputDescription) to focus
        },
        
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'; // STEP.36 ---------------
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);  
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }
        },
        
        displayPercentages: function(percentages) { // STEP.30 ---------------
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);  // querySelectorAll returns a NodeList, so we cannot use 'foreach' method and we created our own 'foreach' function.
           
            /*
            // This function was originally written here but we passed outside from this scope so it can be called from other functions
            // Writing this function separately we can use it for further NodeLists
            var nodeListForEach = function(list, callback) { // STEP.31 Our ForEach function constructor ---------------
               for (var i = 0; i <list.length; i++) {
                    callback(list[i], i ); // function(current, index)
                    
                }                             
            };
            */
            
            nodeListForEach(fields, function(current, index) { // STEP.32 Here we simulate calling a forEach function ---------------
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';    
                } else {
                    current.textContent = '---';
                }
            });
            
              /*  
            // With the new forEach support, previous code can be simply written as:
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            fields.forEach(function(current, index){
                if (percentages[index] > 0) {
                    current.textContent = percentages[index];
                } else {
                    current.textContent = '---';
                };
            });
            */
            
        },  
        
        displayMonth: function() { // STEP.37 Displays the date ---------------
            var now, year; 
            now = new Date(); 
            //var christmas = new Date(2020, 11, 25) //Month 11 because is zero based
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();   
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
            
        },  
        
        changedType: function() { // STEP.39 ---------------
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
           
            nodeListForEach(fields, function(curr) { // STEP.41 we call the function and toggle red focus ---------------
               curr.classList.toggle('red-focus');
            });
                        
            /*
            // We can do the same thing with the usual forEach method
            fields.forEach(function(curr) {
                curr.classList.toggle('red-focus');
            });*/

            
        },
        
        // Exposing the DOMstrings into the public variables
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();


// GLOBAL APP CONTROLLER 
// Tells the other modules what to do & calls the other methods/modules
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {                          
        // Variable to get the DOMstrings from UICtrl
        var DOM = UICtrl.getDOMstrings();
        
        // STEP.1 Add events listeners on click and keypress-enter ---------------
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener ('keypress', function(event) { 
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();  // STEP.2 Execute ctrlAddItem function ---------------      
            }
        });
          
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); // STEP.17 Execute ctrDeleteItem function on the parent container for all the income and expenses have in common. --------------- 
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType); // STEP. 38---------------

    };    
    
    
    var updateBudget = function() {
      
        // 1. Calculate the budget
        budgetCtrl.calculateBudget(); // STEP.12 ---------------
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget(); // STEP.15 ---------------
        
        // 3. Display the budget on the UI     
        UICtrl.displayBudget(budget);
    };     
    
    
    var updatePercentages = function() { // STEP.24 ---------------
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages); // STEP.29 ---------------
    };
    
    var ctrlAddItem = function () {        
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput(); // STEP.3 Call getInput function ---------------
        //console.log(input);
        
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) { // STEP.10 --------------- Polishing: Input should be different from an empty string, NaN and 0.
             
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value); // STEP.5 Call the addItem function --------------- // The input variable has the getInput object parameters stored
            //console.log(newItem); 

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type); // STEP.7 --------------- Call the addListItem function

            // 4. Clear the fields
            UICtrl.clearFields(); // STEP.8 ---------------       


            // 5. Calculate and update budget 
            updateBudget(); // STEP.11 --------------- Separate updateBudget module with specific functions
            
            // 6. Calculate and update percentages
            updatePercentages();
        }
       
    };
    
    var ctrlDeleteItem = function(event){ // STEP.18 --------------- 

        var itemID, splitID, type, ID;
        
        console.log (event.target);
        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id); //This way we escalate through the DOM tree (DOM traversing) until we reach the parent element: <div class="item clearfix" id="income-0"> when we click on the X icon to select the whole element. // STEP.19 --------------- Target method reaches where we click on the screen (HTML elements)
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-'); //This method breaks up a string and returns an array with elements separated v.gr.: var s = 'inc-1-type-3' -> "inc" "1" "type" "3"
            type = splitID[0]; 
            ID = parseInt(splitID[1]); // STEP.19.1 --------------- We passed the string to STEP.19 therefore in the deleteItem method we are comparing a string to a number. That's why we corrected this issue with parseInt.
            
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID); // STEP.20 --------------- 
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID); // STEP.22 ---------------
            
            // 3. Update and show the new budget 
            updateBudget();
            
            // 4. Calculate and update percentages
            updatePercentages();
        }
    };
    
   
    return { // We create an initialization public method calling all the setupEventLsiteners & triggering it from the outside and start the app
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
              budget: 0,
              totalInc: 0, 
              totalExp: 0,
              percentage: -1
          });
            setupEventListeners();
        }            
    };   
    
    
})(budgetController, UIController); // We call the other 2 modules here, and we set the arguments as budgetCtrl & UICtrl in GLOBAL APP CONTROLLER, so we don't need to rewrite the names if we rewrite the modules names


controller.init();




// STEP. ---------------

/*

1. Hacemos un event listener que comenzará a trabajar al hacer click o dar enter.

2. 'ctrlAddItem' se ejecuta desde el app controller, esta se encarga de varios procesos, como de mandar llamar al UIctrl para poder leer los datos introducidos por el usuario.

    3. 'getInput' leerá los valores de los campos y los regresará de manera pública para que los demás módulos puedan leerlos.
    
    4. 'newItem' manda a llamar a la función addItem del bdgtCtrl con los valores de 'getInput' como parámetros.
    
    5 & 6. 'addItem' recibirá como argumentos los valores y creará un objeto (con un function constructor hecho antes) con un 'ID' según si es 'inc' o 'exp' y lo almacenará en una matriz de la que previamente hicimos una esctructura de contenedores para guardarlos (data.allItems[type]). Este objeto se retorna 'newItem'.
    
    7. 'addListItem' manda como parámetros el objeto creado y el tipo ('inc' || 'exp') al UICtrl que creará un nuevo elemento HTML con la cadena tomada del documento, en el 'div' especificado que ya agregamos a nuestro 'DOMstrings'.
        Encerramos el id en '%' para que sea tomado como cadena y reemplazarlo con el 'obj.id', sucesivamente con los demás elementos.
        Aplicamos 'insertAdjacentHTML' 'beforeend' para que aparezcan en la UI uno debajo del otro.
    
    8 & 9. 'clearFields' limpiará nuestros input-boxes del UI.
    
    10. Pulimos el input para que sólo se ejecute la app cuando haya texto, números y valores mayores a 0.
    
    11. 'updateBudget' se ejecuta con diferentes módulos para funciones específicas del budget.

12, 13 & 14. 'calculateBudget' regresará de forma pública el porcentage y el budget. Los totales se calculan de forma privada en 'calculateTotal' y se almacenan en los contenedores, todo esto dentro del budgetCtrl.  

15. 'budget' es una variable que obtiene el retorno de los elementos guardados (total, total.inc, total.exp y percentage), los 4 en un mismo objeto.

16. Es más fácil regresar un objeto con 4 propiedades de una vez.

<---Preparamos los elementos necesarios para eliminar items
Queremos obtener el TYPE y el ID del elemento y separarlos en 2 (ver paso 18).
No queremos hacer un método para cada elemento, sino un 'event handler' del elemento padre de ambos (inc y exp) que va a interactuar con ellos. En este caso es '<div class="container clearfix">' quien contiene a su vez 2 contenedores para c/u. 

    17. Cada vez que se haga clic en alguna parte del contenedor, se ejecutará ctrlDeleteItem.
    Para el «event handler» elegimos el parent element 'container clearfix' del documento que contiene todos los incomes y expenses lists. Lo hacemos de esta manera porque queremos crear 'event delegation', en lugar de agregar un event listener para cada elemento, lo agregamos al contenedor para hacer bubbling up. La función que está atada al contenedor es ctrlDeleteItem. 
    
    18. Debido a que el «event handler» ejecuta ctrlDeleteItem cuando damos click en CUALQUIER parte del parent container ('container clearfix'), si vamos a dar click al icono para eliminar un elemento, debemos escalar hasta el elemento padre (DOM traversing). Obtenemos el ID del elemento que nos interesa y lo guardamos en una variable. Esta variable la aislamos en un tipo y un ID en variables por separado. De esta manera ctrlDeleteItem no avanza si no obtuvo un ID aunque demos clicks en todo el contenedor.
    
    19. El método target nos devuelve el elemento HTML donde hicimos click.
        19.1 No se eliminaba ningún elemento del Global Data Container al darle click al ícono para eliminar elemento debido a que al tomar el ID del elemento en cuestión y luego separarlo en dos con 'split', éste método devuelve una cadena, por ello debemos convertirlo de nuevo a número con 'parseInt' y asignárselo como parámetro a 'budgetCtrl.deleteItem(type, ID)'.
----> Elementos listos

21. Virtualmente tenemos un array con 4 index (contando desde el 0) y queremos borrar el 3ro, pero en real nuestro index 3 ya no existe y su lugar lo ocupó el elemento '6'. Por ello creamos una copia del array con el método 'map', «return current.id» devuelve el elemento que nos interesa (6). Con indexOf nos devuelve el index donde se encuentra el elemento '6' (en este caso está en el 3). 'Splice' eliminará ese elemento.

    // id = 6
    // ids = [1 2 4 6 8]
    // index = 3
22 & 23. Delete Item from the UI with DOM manipulation --> https://blog.garstasio.com/you-dont-need-jquery/dom-manipulation/  

24. Actualizará los porcentajes cada vez que se agregue o elimine un elemento.

25 & 26. Añadimos un this.percentage al objeto de 'expenses'. Creamos dos prototipos para el function constructor, uno que se encarga de calcular el porcentaje y otro que lo devuelva.

27 & 28. A todos los objetos 'exp' del contenedor global se les ejecutará su prototipo para calcular porcentajes.
    - calculatePercentages: El método 'foreach' calculará los porcentajes. Pasamos como parámetro el total de los incomes ('data.totals.inc') al prototipo para que lo haga.
    - getPercentages: El método 'map' crea un nuevo array, este método puede mandar llamar una función por cada elemento, así que se cicla regresando por cada elemento del nuevo array el porcentaje leído/obtenido del prototipo 'getPercentage', y guardará cada uno en la variable 'allPerc'.
Todos estos porcentajes se retornan/guardan en la variable 'percentages' del GLOBAL APP CONTROLLER.
         
29 & 30. Llamamos a 'UICtrl.displayPercentages(percentages)' usando 'percentages' como parámetro que ya obtuvimos del cálculo previo.

31 & 32. Tomamos todos los elementos de expenses con el DOMstring del porcentaje, simularemos llamar un método 'forEach'con 'nodeListForEach' que estará en una función independiente para que podamos usarla más adelante en nuestro código de ser necesario con otros NodeLists.
    NodeListForEach toma la lista y la función del foreach como si fuera un callback, creamos un loop for que trabajará en toda la lista. En cada iteración 'callback' es llamado, y dado que *'callback' tiene asignado a sí mismos 2 parámetros* (current, index) sólo hay que definir que 'current' es la lista en la posición[i] y el índex' es [i].
    De esta manera el forEach simulado (nodeListForEach) tendrá acceso al current e index porque los pasamos en el callback.
Cabe destacar que forEach ahora ya tiene soporte para trabajar arrays con NodeLists y puede simplificarse el código como se muestra el bloque de observaciones.
33. Para darle formato a los números debemos convertirlo a valor absoluto, es decir, remover el signo de menos (-) ya que nosotros lo vamos a agregar si es 'exp' o positivo (+) si es inc. Y hacemos un fix a sólo 2 decimales.
34. El entero lo dividimos en 2 y la subcadena le decimos a partir de dónde va a iniciar a contar para poner la coma.
    El retorno es el formato como lo vamos a mandar a imprimir. Usamos un operador ternario para elegir primero el signo. Dado que es un operador, podemos agruparlo con los demás elementos con la concatenación '+', sumar un espacio, el entero con la coma y los 2 decimales.
35. Imprimimos el valor con el formato ('sign, integer, 2 decimals' -> + 12,345.67 ).
36. También el Display Budget general se aplicará con el mismo formato, pero dado que no sabemos si será positivo o negativo, usaremos un operador ternario para declarar el parámetro 'type'.
37. Creamos un objeto 'Date' con el ya existente 'new Date()' constructor de JS. Es preferible obtener el año con 'getFullYear' en sustitución de 'getYear'. Esta función la mandamos llamar desde el 'init function'.
38.Creamos un 'eventListener' ('changedType') que nos cambie el color de los campos de 'type', 'description', 'value' y el icono cuando cambiamos de tipo (+) o (-).
39. Seleccionamos todos los campos con 'querySelectorAll' separados por una coma (,) dado que es un selector de CSS.
40. Sacamos el 'nodeListForEach' function creado en el paso 31 para poder llamarlo desde 'changedType' y tenga acceso
41. Llamamos el método 'nodeListForEach' e intercambiamos a la clase 'red-focus' (que se encuentra en nuestro archivo CSS) cuando se seleccione otra opción, en este caso un expense (-). Ya que hay soporte para nodeLists ya podemos usar el método 'forEach'.
 
*/



/*

GLOSARIO
-Event Handler
-DOM traversing: Desplazarse a través del DOM a sus diferentes nodos.


MÉTODOS CON ARRAYS
-Slice: Regresa los elementos seleccionados de un array, como un array nuevo (el array original no será modificado).
-Splice: Escribe o borra elementos de un array: array.splice(index, howmany, item1, ....., itemX)
-Split: Separa una cadena y la convierte en un nuevo array. 
-Map: Crea un array nuevo. Permite hacer operaciones en un array y sí retorna resultados.
-Foreach: Permite hacer operaciones en un array pero no retorna resultados para usarlos más adelante o guardarlos en una variable. 



MÉTODOS CON STRINGS
Las cadenas son primitivas, pero tan pronto como llamemos un método, JS envuelve la cadena como un objeto.  
-Split: Separa una cadena y la convierte en un nuevo array. 
-ToFixed: 

*/


