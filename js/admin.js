//自己的API資訊
const api_path = "minchun";
const baseUrl = "https://livejs-api.hexschool.io";
const config = {
    headers: {
        Authorization: "fa4lT03b02bLINxtz2Rxt75BOut1"
    }
};


//全域設定及DOM綁定
const orderList = document.querySelector('.js-orderList');
const deleteAllOrderBtn = document.querySelector('.js-deleteAllOrder')
let orderData = [];


//資料初始化
function init() {
    getOrderList();
}
init();

//取得訂單列表
function getOrderList() {
    axios.get(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`, config)
        .then(function (response) {
            orderData = response.data.orders;
            console.log(orderData);
            let str = '';
            orderData.forEach(function (item) {
                //產品字串組合
                let productItemstr = '';
                item.products.forEach(function (productItem) {
                    productItemstr += `<p>${productItem.title} X ${productItem.quantity}</p>`;
                })

                //判斷訂單處理狀態
                let orderStatus = '';
                if (item.paid == true) {
                    orderStatus = "已處理完成";
                }
                else {
                    orderStatus = "未處理";
                }

                str += `<tr class="border-dark border-bottom border-1">
            <th scope="row">${item.createdAt}</th>
            <td>${item.user.name}</td>
            <td>${item.user.tel}</td>
            <td>${item.user.address}</td>
            <td>
                ${productItemstr}
            </td>
            <td>
                <a href="#">${orderStatus}</a>
            </td>
            <td>
                <button class="btn btn-danger js-orderDelete" type="button" data-id="${item.id}">刪除</button>
            </td>
          </tr>`
            })

            orderList.innerHTML = str;
            renderC3()
        })
        .catch(function (error) {
            console.log(error.response.data);
        })
}


//C3繪製
function renderC3(){
    //資料蒐集
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category] == undefined){
                total[productItem.category] = productItem.price;
            }
            else {
                total[productItem.category] += productItem.price;
            }
        })
    })
    //轉換為C3可讀之陣列格式
    let categoryAry = Object.keys(total);
    //透過total + category 組成C3格式
    let newData = [];
    categoryAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    let chart = c3.generate({
        bindto:'.chart',
        data:{
            columns: newData,
            type:"pie"
        },
        size: {
            width: 600,
            height: 450
          }
    });
}


//刪除特定訂單
orderList.addEventListener('click',function(e){
    let orderId = e.target.getAttribute('data-id');
    if(orderId == null){
        return;
    }
    deleteOrderItem(orderId);
})

function deleteOrderItem(orderId){
    axios.delete(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders/${orderId}`,config)
    .then(function(response){
        alert('刪除訂單成功!');
        getOrderList();
    })
}

//刪除全部訂單
function deleteAllOrder(){
    axios.delete(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`,config)
    .then(function(response){
        alert('訂單已全部刪除成功!');
        getOrderList();
    })
}
deleteAllOrderBtn.addEventListener('click',function(e){
    deleteAllOrder();
})