const itemInput = document.getElementById("itemInput");
const priceInput = document.getElementById("priceInput");
const shoppingList = document.getElementById("shoppingList");
const totalCost = document.getElementById("totalCost");
const cartCount = document.querySelector(".cart-count");

const addBtn = document.getElementById("addBtn");
const purchasedBtn = document.getElementById("purchasedBtn");
const clearBtn = document.getElementById("clearBtn");
const storageKey = "blushly-shopping-list";

let items = loadItems();

function loadItems() {
    try {
        const savedItems = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (!Array.isArray(savedItems)) {
            throw new Error("Saved shopping list is not an array.");
        }

        return savedItems.filter((item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            Number.isFinite(item.price) &&
            typeof item.selected === "boolean" &&
            typeof item.purchased === "boolean"
        );
    } catch (error) {
        console.error("Could not load the saved shopping list.", error);
        return [];
    }
}

function saveItems() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
        console.error("Could not save the shopping list.", error);
    }
}

function renderItems() {
    shoppingList.replaceChildren();

    items.forEach((item) => {
        const li = document.createElement("li");
        li.dataset.id = item.id;
        if (item.purchased) {
            li.classList.add("purchased");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "item-checkbox";
        checkbox.checked = item.selected;
        checkbox.disabled = item.purchased;
        checkbox.setAttribute("aria-label", `Select ${item.name} for total cost`);

        const itemName = document.createElement("span");
        itemName.className = "item-name";
        itemName.textContent = item.name;

        const itemPrice = document.createElement("span");
        itemPrice.className = "item-price";
        itemPrice.textContent = `KSh ${item.price.toFixed(2)}`;

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.dataset.action = "edit";
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", `Edit ${item.name}`);

        li.append(checkbox, itemName, itemPrice, editButton);
        shoppingList.appendChild(li);
    });

    const selectedTotal = items.reduce(
        (sum, item) => sum + (item.selected ? item.price : 0),
        0
    );
    totalCost.textContent = selectedTotal.toFixed(2);
    cartCount.textContent = String(items.length);
}

function addItem(name, price) {
    items.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        price,
        selected: false,
        purchased: false
    });
    saveItems();
    renderItems();
}

function addManualItem() {
    const name = itemInput.value.trim();
    const priceText = priceInput.value.trim();
    const price = Number(priceText);

    if (!name) {
        alert("Please enter an item name.");
        itemInput.focus();
        return;
    }

    if (!priceText || !Number.isFinite(price) || price < 0) {
        alert("Please enter a valid price.");
        priceInput.focus();
        return;
    }

    addItem(name, price);
    itemInput.value = "";
    priceInput.value = "";
    itemInput.focus();
}

addBtn.addEventListener("click", addManualItem);

document.querySelectorAll(".product-card").forEach((card) => {
    const button = card.querySelector(".product-button");
    const name = card.querySelector("h3")?.textContent.trim();
    const priceText = card.querySelector(".price")?.textContent || "";
    const price = Number(priceText.replace(/[^\d.]/g, ""));

    if (button && name && Number.isFinite(price)) {
        button.addEventListener("click", () => addItem(name, price));
    }
});

shoppingList.addEventListener("change", (event) => {
    if (!event.target.matches(".item-checkbox")) {
        return;
    }

    const item = items.find((listItem) =>
        listItem.id === event.target.closest("li").dataset.id
    );
    if (item) {
        item.selected = event.target.checked;
        saveItems();
        renderItems();
    }
});

shoppingList.addEventListener("click", (event) => {
    if (event.target.dataset.action !== "edit") {
        return;
    }

    const listItem = event.target.closest("li");
    const item = items.find((listItemData) => listItemData.id === listItem.dataset.id);
    if (!item) {
        return;
    }

    const updatedName = prompt("Edit product name:", item.name);
    if (updatedName === null || !updatedName.trim()) {
        return;
    }

    item.name = updatedName.trim();
    saveItems();
    renderItems();
});

purchasedBtn.addEventListener("click", () => {
    const selectedItems = items.filter((item) => item.selected);
    if (selectedItems.length === 0) {
        alert("Please select items first.");
        return;
    }

    selectedItems.forEach((item) => {
        item.purchased = true;
        item.selected = false;
    });
    saveItems();
    renderItems();
});

clearBtn.addEventListener("click", () => {
    items = [];
    saveItems();
    renderItems();
});

renderItems();
