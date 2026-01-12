const input = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("itemList");
const emptyMessage = document.getElementById("emptyMessage");

let items = JSON.parse(localStorage.getItem("nestlist-items")) || [];

function saveItems() {
    localStorage.setItem("nestlist-items", JSON.stringify(items));
}

function render() {
    list.innerHTML = "";

    if (items.length === 0) {
    emptyMessage.style.display = "block";
    return;
    }

    emptyMessage.style.display = "none";

    items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "item";

    const span = document.createElement("span");
    span.textContent = item;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => {
        items.splice(index, 1);
        saveItems();
        render();
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
});
}


addBtn.addEventListener("click", () => {
    const value = input.value.trim();
    if (value === "") return;

    items.push(value);
    console.log(items); // ← 追加
    saveItems();
    render();
});




render();