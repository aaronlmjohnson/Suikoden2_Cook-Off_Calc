fetch('https://suikoden-2-cook-off-calculator.s3.us-east-2.amazonaws.com/json/dishes.json')
.then(data=> data.json())
.then(data => {
    const characterGrid = document.getElementById("characters");
    const recipesGrid = document.getElementById("recipes");
    const form = document.getElementById("myForm");
    form.addEventListener('submit', findBestDishes);

    let clickCount = 0;
    let selectedCharacters;
    let selectedRecipes;
    
    const charKeys = Object.keys(data.Characters);
    const dishKeys = Object.keys(data.Dishes);
    
    charKeys.forEach((character)=>{

        const cell = document.createElement("div");
        
        cell.onclick = ()=>{
            selectCharacter(cell);
            selectedCharacters = fixSpecialNames([...document.getElementsByClassName("selected")].map(element => element.innerText)); 
        };
        fillCharacterCell(cell, character);
    });

    dishKeys.forEach((recipe)=>{
        const cell = document.createElement("div");
        cell.onclick= ()=>{
            selectRecipe(cell);
            selectedRecipes = [...document.getElementsByClassName("selected-recipe")].map(element => element.innerText);
        }
        createRecipeCell(cell, recipe);
    });

    selectedRecipes = [...document.getElementsByClassName("selected-recipe")].map(element => element.innerText);
    
    
    
    
    

    function fillCharacterCell(cell, name){
        cell.setAttribute("class", "cell");
        let charName = adjustName(name);

        const characterName = document.createElement("p");
        
        characterName.append(document.createTextNode(charName));

        const portrait = document.createElement("img");
        
        portrait.setAttribute("src", `./images/${name.toLowerCase()}.gif`);

        cell.append(portrait);
        cell.append(characterName);
        characterGrid.append(cell);
    }

    function createRecipeCell(cell, recipe){
        cell.setAttribute("class", "cell");
        cell.classList.add("class", "selected-recipe");
        const recipeName = document.createElement("p");
        recipeName.append(document.createTextNode(recipe));
        cell.append(recipeName);
        recipesGrid.append(cell);

    }

    function adjustName(name){
        let charName;
        switch(name){
            case "longchanchan":
                charName = "L.C.Chan";
                break;
            case "TaiHo":
                charName = "Tai Ho";
                break;
            case "LoWen":
                charName = "Lo Wen";
                break;
            case "YamKoo":
                charName = "Yam Koo";
                break;
            default:
                charName = name;
                break;
        }
        return charName;
    }

    function selectCharacter(cell){
        if(cell.classList.contains("selected")){
            cell.classList.remove("selected");
            clickCount--;
            return;
        }
            
        if(clickCount == 4)
            return;

        cell.classList.add("selected");
        clickCount++;
    }

    function selectRecipe(cell){
        if(cell.classList.contains("selected-recipe")){
            cell.classList.remove("selected-recipe");
            return;
        }

        cell.classList.add("selected-recipe");
    }

    function findBestDishes(event) { 
        event.preventDefault();
        const tastes = getTastes(selectedCharacters, data.Characters);
        const dishes = getDishes(data, selectedRecipes);
        
        const dishFiltered = filterDishes(dishes, ["Dish", "Type", "Spice"].concat(tastes));
        
        const app = (bestMeal(filterByType(dishFiltered, "Appetizer").concat(filterByType(dishFiltered, "Surprise")), tastes));
        const main = bestMeal(filterByType(dishFiltered, "Main").concat(filterByType(dishFiltered, "Surprise")), tastes);
        const dessert = bestMeal(filterByType(dishFiltered, "Dessert").concat(filterByType(dishFiltered, "Surprise")), tastes);
    
        const meal = document.getElementById("meals");
        const courses = { appetizer: "", maincourse: "", dessert: ""};
        
        for(course in courses){
            let bestDish = course == "appetizer" ? app : course == "main" ? main : dessert;
            courses[course] = createElementById(course, `${course}: ${bestDish.Dish} = ${getDishRecipe(bestDish)} + ${bestDish.Spice}`);
            meal.append(courses[course]);
        }
    } 

    function createElementById(id, content){
        element = document.getElementById(id);
        if(element.innerText)
            element.innerText = "";

        text = document.createTextNode(content)
        element.append(text);
        return element;
    }

    function getDishes(data, selectedRecipes){
        let dishes = [];
        for(recipe in data.Dishes){
            data.Dishes[recipe].forEach(dish => {
                if(selectedRecipes.includes(recipe))
                    dishes.push(dish);
            });
        }
        return dishes;
    }
    function filterDishes(dishes, allowed){
        let filtered = [];

        dishes.forEach((dish)=>{
            filtered.push(Object.keys(dish)
            .filter(key => allowed.includes(key))
            .reduce((obj, key) => {
                obj[key] = dish[key];
                return obj;
            }, {}));
              
              
        });
        return filtered
    }

    function getTastes(selectedChars, allChars){
        let tastes = [];
        
        
        for(char in allChars)
            if(selectedChars.includes(char))
                tastes.push(allChars[char]);

        return [...new Set(tastes)];
    }

    function fixSpecialNames(selectedChars){
        fixedName = [];
        selectedChars.forEach(name => {
            if(name == "L.C.Chan")
                fixedName.push("longchanchan");
            else
                fixedName.push(name.replace(/\s/g, ''));
        });
        return fixedName;
    }

    function bestMeal(dishes, tastes){
        
        // gratin, fried rice, tonk, ramen, sushi, sashimi combo, special stew, kaiseki dinner
        //sid, fitcher, vincent, lowen
        let tasteValues = filterDishes(dishes, tastes);
        let max = 0;
        let max_i;
        tasteValues.forEach((dish, i) =>{
            let accum = 0;
            for(taste in dish){
                accum += parseInt(dish[taste]);
 
                if(max < 1 || accum > max){
                    max = accum;
                    max_i = i;
                }
                    
            }
        });
        return dishes[max_i];
        
    }

    function filterByType(dishes, type){
        let filtered = [];
        
        dishes.forEach(dish => {
            if(dish.Type == type)
                filtered.push(dish);
        });
        return filtered;
    }

    function getDishRecipe(food){
        let value;
        for(recipe in data.Dishes){
            data.Dishes[recipe].forEach(dish => {
                if(dish.Dish == food.Dish){
                    value = recipe;
                    return;
                }    
            })
        }
        return value;
    }
});



