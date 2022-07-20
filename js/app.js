let client = {
    table: '',
    hour: '',
    order: []
};

const categorys = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnSaveClient = document.querySelector('#guardar-cliente');
btnSaveClient.addEventListener('click', saveClient);

function saveClient() {
    const table = document.querySelector('#mesa').value;
    const hour = document.querySelector('#hora').value;

    //Review yes there are fields empties
    const fieldsEmpties = [table, hour].some(field => field === '');

    if (fieldsEmpties) {

        //verify yes there a alert
        const existAlert = document.querySelector('.invalid-feedback');

        if (!existAlert) {
            const alert = document.createElement('div');
            alert.classList.add('invalid-feedback', 'd-block', 'text-center');
            alert.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alert);

            //Delete Alert
            setTimeout(() => {
                alert.remove();
            }, 2500);
        }

        return;
    }

    //Assign form data to client
    client = { ...client, table, hour };

    //Hide modal
    const formModal = document.querySelector('#formulario');
    const bootstrapModal = bootstrap.Modal.getInstance(formModal);
    bootstrapModal.hide();

    //Show Sections
    showSections();

    //Get dishes from API JSON-SERVER
    getDishes();
}

function showSections() {
    const hideSections = document.querySelectorAll('.d-none');
    hideSections.forEach(section => section.classList.remove('d-none'));
}

function getDishes() {
    const url = '/db.json';

    fetch(url)
        .then(response => response.json())
        .then(result => showDishes(result.dishes))
        .catch(error => console.log(error))
}

function showDishes(dishes) {
    const content = document.querySelector('#platillos .contenido');

    dishes.forEach(dishe => {
        const row = document.createElement('div');
        row.classList.add('row', 'py-3', 'border-top');

        const name = document.createElement('div');
        name.classList.add('col-md-4');
        name.textContent = dishe.name;

        const price = document.createElement('div');
        price.classList.add('col-md-3', 'fw-bold');
        price.textContent = `$${dishe.price}`;

        const category = document.createElement('div');
        category.classList.add('col-md-3');
        category.textContent = categorys[dishe.category];

        const amountInput = document.createElement('Input');
        amountInput.type = 'number';
        amountInput.min = 0;
        amountInput.value = 0;
        amountInput.id = `product-${dishe.id}`;
        amountInput.classList.add('form-control');

        //Function that detects the amount and dish that is added
        amountInput.onchange = function () {
            const amount = parseInt(amountInput.value);
            addDishe({ ...dishe, amount });
        }


        const add = document.createElement('div');
        add.classList.add('col-md-2');
        add.appendChild(amountInput);

        row.appendChild(name);
        row.appendChild(price);
        row.appendChild(category);
        row.appendChild(add);
        content.appendChild(row);
    })
}

function addDishe(product) {
    //Extract current order
    let { order } = client;

    //Check that the amount is greater than 0
    if (product.amount > 0) {

        //Check if item exist in the array
        if (order.some(article => article.id === product.id)) {
            //the item already exists, update amount
            const orderUpdate = order.map(article => {
                if (article.id === product.id) {
                    article.amount = product.amount;
                }
                return article;
            });
            //is assigned the new array to client.order
            client.order = [...orderUpdate];

        } else {
            //The item not exist, we add it in the array
            client.order = [...order, product];
        }
    } else {
        //Delete items when amount is 0
        const result = order.filter(article => article.id !== product.id);
        client.order = [...result];
    }

    //Clean code HTML previous
    cleanHTML();

    if (client.order.length) {
        //Show summary
        updateSummary();
    } else {
        messageEmptyOrder();
    }


}

function updateSummary() {
    const content = document.querySelector('#resumen .contenido');

    const summary = document.createElement('div');
    summary.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    //Table information
    const table = document.createElement('p');
    table.textContent = 'Mesa ';
    table.classList.add('fw-bold');

    const tableSpan = document.createElement('span');
    tableSpan.textContent = client.table;
    tableSpan.classList.add('fw-normal');

    //Hour information
    const hour = document.createElement('p');
    hour.textContent = 'Hora ';
    hour.classList.add('fw-bold');

    const hourSpan = document.createElement('span');
    hourSpan.textContent = client.hour;
    hourSpan.classList.add('fw-normal');

    //Section title
    const heading = document.createElement('h3');
    heading.textContent = 'Platillos consumidos';
    heading.classList.add('my-4', 'text-center');

    //Iterate on the order array
    const group = document.createElement('ul');
    group.classList.add('list-group');

    const { order } = client;
    order.forEach(article => {
        const { name, amount, price, id } = article;

        const list = document.createElement('li');
        list.classList.add('list-group-item');

        const nameEl = document.createElement('h4');
        nameEl.classList.add('my-4');
        nameEl.textContent = name;

        //Item amount
        const amountEl = document.createElement('p');
        amountEl.classList.add('fw-bold');
        amountEl.textContent = 'Cantidad ';

        const amountValue = document.createElement('span');
        amountValue.classList.add('fw-normal');
        amountValue.textContent = amount;


        //Item price
        const priceEl = document.createElement('p');
        priceEl.classList.add('fw-bold');
        priceEl.textContent = 'Precio ';

        const priceValue = document.createElement('span');
        priceValue.classList.add('fw-normal');
        priceValue.textContent = `$${price}`;


        //Article subtotal
        const subtotalEl = document.createElement('p');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal ';

        const subtotalValue = document.createElement('span');
        subtotalValue.classList.add('fw-normal');
        subtotalValue.textContent = caculateSubtotal(price, amount);


        //Buton for delete
        const btnDelete = document.createElement('button');
        btnDelete.classList.add('btn', 'btn-danger');
        btnDelete.textContent = 'Eliminar del pedido'

        //Function for delete from order
        btnDelete.onclick = function () {
            deleteProduct(id);
        }


        //Add values to your containers
        amountEl.appendChild(amountValue);
        priceEl.appendChild(priceValue);
        subtotalEl.appendChild(subtotalValue);

        //Add item in Li
        list.appendChild(nameEl);
        list.appendChild(amountEl);
        list.appendChild(priceEl);
        list.appendChild(subtotalEl);
        list.appendChild(btnDelete);

        //Add list in main group
        group.appendChild(list);

    });

    //Add to parent element
    table.appendChild(tableSpan);
    hour.appendChild(hourSpan);

    //Add to content
    summary.appendChild(heading);
    summary.appendChild(table);
    summary.appendChild(hour);
    summary.appendChild(group);

    content.appendChild(summary);

    //Show tip form
    tipForm();
}

function cleanHTML() {
    const content = document.querySelector('#resumen .contenido');

    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }
}

function caculateSubtotal(price, cantidad) {
    return `$ ${price * cantidad}`;
}

function deleteProduct(id) {
    const { order } = client;
    const result = order.filter(article => article.id !== id);
    client.order = [...result];

    //Clean code HTML previous
    cleanHTML();

    if (client.order.length) {
        //Show summary
        updateSummary();
    } else {
        messageEmptyOrder();
    }

    //The product is deleted thus the amount come back to 0 in the form
    const productDeleted = `#product-${id}`;
    const inputDeleted = document.querySelector(productDeleted);
    inputDeleted.value = 0;
}

function messageEmptyOrder() {
    const content = document.querySelector('#resumen .contenido');

    const text = document.createElement('p');
    text.classList.add('text-center');
    text.textContent = 'Añade los elementos del pedido';

    content.appendChild(text);
}

function tipForm() {

    const content = document.querySelector('#resumen .contenido');

    const form = document.createElement('div');
    form.classList.add('col-md-6', 'formulario');

    const divForm = document.createElement('div');
    divForm.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';


    //Radio button 10%
    const radio10 = document.createElement('input');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = "10";
    radio10.classList.add('form-check-input');
    radio10.onclick = calculateTip;

    const radio10Label = document.createElement('label');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('div');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);


    //Radio button 25%
    const radio25 = document.createElement('input');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = "25";
    radio25.classList.add('form-check-input');
    radio25.onclick = calculateTip;

    const radio25Label = document.createElement('label');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('div');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);


    //Radio button 50%
    const radio50 = document.createElement('input');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = "50";
    radio50.classList.add('form-check-input');
    radio50.onclick = calculateTip;

    const radio50Label = document.createElement('label');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('div');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);



    //Add principal div
    divForm.appendChild(heading);
    divForm.appendChild(radio10Div);
    divForm.appendChild(radio25Div);
    divForm.appendChild(radio50Div);

    //Add to form
    form.appendChild(divForm);


    content.appendChild(form);
}

function calculateTip() {

    const { order } = client;

    let subtotal = 0;

    //Calucate subtotal to pay
    order.forEach(article => {
        subtotal += article.amount * article.price;
    });

    //Selected radio button with client's tip
    const tipSelected = document.querySelector('[name="propina"]:checked').value;

    //Calculate tip
    const tip = Math.round(((subtotal * parseInt(tipSelected)) / 100));

    //Calcultate total to pay
    const total = subtotal + tip;

    showTotalHtml(subtotal, total, tip);
}

function showTotalHtml(subtotal, total, tip) {

    const totalsDiv = document.createElement('div');
    totalsDiv.classList.add('total-pagar');

    //Subtotal
    const subtotalParagraph = document.createElement('p');
    subtotalParagraph.classList.add('fs-4', 'fw-bold','mt-2');
    subtotalParagraph.textContent = 'Subtotal Consumo: '

    const subtotalSpan = document.createElement('span');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    subtotalParagraph.appendChild(subtotalSpan);


    //Tip
    const tipParagraph = document.createElement('p');
    tipParagraph.classList.add('fs-4', 'fw-bold','mt-2');
    tipParagraph.textContent = 'Propina: '

    const tipSpan = document.createElement('span');
    tipSpan.classList.add('fw-normal');
    tipSpan.textContent = `$${tip}`;

    tipParagraph.appendChild(tipSpan);


    //Total
    const totalParagraph = document.createElement('p');
    totalParagraph.classList.add('fs-4', 'fw-bold','mt-2');
    totalParagraph.textContent = 'Total: '

    const totalSpan = document.createElement('span');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParagraph.appendChild(totalSpan);


    //Eliminate the last result
    const totalPayDiv = document.querySelector('.total-pagar');
    if(totalPayDiv){
        totalPayDiv.remove();
    }


    totalsDiv.appendChild(subtotalParagraph);
    totalsDiv.appendChild(tipParagraph);
    totalsDiv.appendChild(totalParagraph);

    const form = document.querySelector('.formulario > div');
    form.appendChild(totalsDiv);

}