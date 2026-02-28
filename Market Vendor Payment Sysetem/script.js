// LOGIN
function login(){
    if(username.value === "Opio Fred" && password.value === "12345"){
        loginSection.style.display = "none";
        mainSection.style.display = "block";
        loadData();
    } else {
        alert("Wrong Login!");
    }
}

function logout(){
    location.reload();
}

// STORAGE
function getVendors(){
    return JSON.parse(localStorage.getItem("vendors")) || [];
}
function saveVendors(data){
    localStorage.setItem("vendors", JSON.stringify(data));
}
function getPayments(){
    return JSON.parse(localStorage.getItem("payments")) || [];
}
function savePayments(data){
    localStorage.setItem("payments", JSON.stringify(data));
}

// SAVE OR UPDATE VENDOR
function saveVendor(){
    let vendors = getVendors();
    let index = editIndex.value;

    let vendor = {
        name: vName.value,
        phone: vPhone.value,
        stall: vStall.value,
        goods: vGoods.value,
        fee: Number(vFee.value)
    };

    if(index === ""){
        vendors.push(vendor);
    } else {
        vendors[index] = vendor;
        editIndex.value = "";
    }

    saveVendors(vendors);
    clearForm();
    loadData();
}

// EDIT
function editVendor(i){
    let v = getVendors()[i];
    vName.value = v.name;
    vPhone.value = v.phone;
    vStall.value = v.stall;
    vGoods.value = v.goods;
    vFee.value = v.fee;
    editIndex.value = i;
}

// DELETE
function deleteVendor(i){
    let vendors = getVendors();
    vendors.splice(i,1);
    saveVendors(vendors);
    loadData();
}

// ADD PAYMENT
function addPayment(){
    let vendors = getVendors();
    let payments = getPayments();
    let index = vendorSelect.value;

    payments.push({
        vendor: vendors[index].name,
        amount: Number(paymentAmount.value),
        date: paymentDate.value
    });

    savePayments(payments);
    loadData();
}

// CALCULATE BALANCE
function calculateBalance(name, fee){
    let totalPaid = getPayments()
        .filter(p => p.vendor === name)
        .reduce((sum,p)=>sum+p.amount,0);

    return { paid: totalPaid, balance: fee-totalPaid };
}

// SEARCH
function searchVendor(){
    loadData(search.value.toLowerCase());
}

// CLEAR ALL
function clearAll(){
    if(confirm("Are you sure?")){
        localStorage.clear();
        loadData();
    }
}

// DOWNLOAD FUNCTIONS
function downloadPaid(){
    let vendors = getVendors();
    let paid = vendors.filter(v => calculateBalance(v.name,v.fee).balance <= 0);
    exportCSV(paid,"paid_vendors.csv");
}

function downloadUnpaid(){
    let vendors = getVendors();
    let unpaid = vendors.filter(v => calculateBalance(v.name,v.fee).balance > 0);
    exportCSV(unpaid,"unpaid_vendors.csv");
}

function downloadAllPayments(){
    exportCSV(getPayments(),"payment_history.csv");
}

function exportCSV(data, filename){
    if(data.length===0){ alert("No records found"); return; }

    let keys = Object.keys(data[0]);
    let csv = keys.join(",") + "\n";

    data.forEach(row=>{
        csv += keys.map(k=>row[k]).join(",") + "\n";
    });

    let blob = new Blob([csv], {type:"text/csv"});
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// LOAD DATA
function loadData(filter=""){
    let vendors = getVendors();
    let payments = getPayments();

    totalVendors.innerText = vendors.length;
    totalPayments.innerText = payments.length;

    vendorTable.innerHTML="";
    vendorSelect.innerHTML="";
    paymentTable.innerHTML="";

    vendors.forEach((v,i)=>{
        if(v.name.toLowerCase().includes(filter)){
            let bal = calculateBalance(v.name,v.fee);

            vendorTable.innerHTML += `
            <tr>
            <td>${v.name}</td>
            <td>${v.fee}</td>
            <td>${bal.paid}</td>
            <td style="color:${bal.balance>0?'red':'green'}">${bal.balance}</td>
            <td><button onclick="editVendor(${i})" class="btn btn-warning btn-sm">Edit</button></td>
            <td><button onclick="deleteVendor(${i})" class="btn btn-danger btn-sm">Delete</button></td>
            </tr>`;
        }

        vendorSelect.innerHTML += `<option value="${i}">${v.name}</option>`;
    });

    payments.forEach(p=>{
        paymentTable.innerHTML += `
        <tr>
        <td>${p.vendor}</td>
        <td>${p.amount}</td>
        <td>${p.date}</td>
        </tr>`;
    });
}

function clearForm(){
    vName.value=""; vPhone.value=""; vStall.value="";
    vGoods.value=""; vFee.value="";
}