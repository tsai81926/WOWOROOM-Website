//自己的API資訊
const api_path = "minchun";
const baseUrl = "https://livejs-api.hexschool.io";
const config = {
  headers: {
    Authorization: "fa4lT03b02bLINxtz2Rxt75BOut1"
  }
};


//全域設定及DOM綁定
const productList = document.querySelector('.js-productList');
const cartList = document.querySelector('.js-cartList');
const cartTotalPrice = document.querySelector('.js-totalPrice');
const productCategory = document.querySelector('.js-productCategory');
const categorySelect = document.querySelector('.js-categorySelect');
const deleteAllCart = document.querySelector('.js-deleteAllCart');
const sendOrder = document.querySelector('.js-sendOrder');

let productData = [];
let cartData = [];


//初始化
function init() {
  getProductList();
  getCartList();
}
init();

//取得產品列表 (產品列表 + 篩選列渲染)
function getProductList() {
  axios.get(`${baseUrl}/api/livejs/v1/customer/${api_path}/products`, config)
    .then(function (response) {
      productData = response.data.products;
      console.log(productData);
      renderProductList();
      getProductCategory();
    })
    .catch(function (error) {
      console.log(error.response.data);
    })
}


//產品列表渲染頁面
function renderProductList() {
  let str = '';
  productData.forEach(function (item, index) {
    str += `<li class="col-6 col-md-4 col-lg-3" data-id="${item.id}">
      <div class="productCard">
          <div class="productCard-head">
              <img src=${item.images} alt="${item.description}">                            
              <span>新品</span>
              <button class="js-addCart" data-id="${item.id}">加入購物車</button>
          </div>
          <div class="productCard-text">
              <p>${item.title}</p>
              <p>NT${item.origin_price}</p>
              <p>NT${item.price}</p>
          </div>
      </div>
  </li>`
  })

  productList.innerHTML = str;
}


//下拉選單渲染(後續有新增種類會彈性變動)
function getProductCategory() {

  //用 map 將資料內的所有 category值 賦予至一新陣列
  let unSortCategory = productData.map(function (item) {
    return item.category;
  })
  // console.log(unSortCategory);

  //用 filter 篩選掉重複的 category值
  let sortedCategory = unSortCategory.filter(function (item, index) {
    return unSortCategory.indexOf(item) === index;
  })
  // console.log(sortedCategory);

  //渲染篩選條件列
  let str = `<option value="全部" selected>全部</option>`;
  sortedCategory.forEach(function (item) {
    str += `<option value="${item}">${item}</option>`
  })
  productCategory.innerHTML = str;
}


//篩選產品列表
categorySelect.addEventListener('change', function (e) {
  let category = e.target.value;
  if (category == '全部') {
    renderProductList();
    return;
  }
  let str = '';
  productData.forEach(function (item) {
    if (item.category == category) {
      str += `<li class="col-6 col-md-4 col-lg-3" data-id=${item.id}>
      <div class="productCard">
          <div class="productCard-head">
              <img src=${item.images} alt="${item.description}">                            
              <span>新品</span>
              <button class="js-addCart">加入購物車</button>
          </div>
          <div class="productCard-text">
              <p>${item.title}</p>
              <p>NT${item.origin_price}</p>
              <p>NT${item.price}</p>
          </div>
      </div>
  </li>`
    }
  })

  productList.innerHTML = str;
})

//取得購物車列表
function getCartList() {
  axios.get(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`, config)
    .then(function (response) {
      cartData = response.data.carts;
      const totalPrice = document.querySelector('.js-totalPrice');
      totalPrice.textContent = response.data.finalTotal;
      console.log(cartData);

      renderCartList(cartData);
    })
    .catch(function (error) {
      console.log(error.response.data);
    })
}

//渲染購物車列表
function renderCartList() {
  let str = '';
  cartData.forEach(function (item, index) {
    str += `<tr>
      <td colspan="2">
          <div class="d-flex">
              <div>
                  <img src=${item.product.images} alt=${item.product.description}>
              </div>
              <p>${item.product.title}</p>
          </div>
      </td>
      <td>${item.product.price}</td>
      <td>
      <span>${item.quantity}</span>
      </td>
      <td>${item.product.price * item.quantity}</td>
      <td class="text-center">
          <button class="border-0 fs-2"><i class="fas fa-times" data-cartId="${item.id}"></i></button>
      </td>
    </tr>`
  })
  cartList.innerHTML = str;
  
  // getCartEditNum();

}

//加入購物車邏輯
//辨識點擊區塊，傳送產品ID至新增購物車函式
productList.addEventListener('click', function (e) {
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "js-addCart") {
    return;
  }
  let productId = e.target.getAttribute("data-id");
  // console.log(productId);
  addCartItem(productId);
})

//加入購物車函式
function addCartItem(id) {
  let numCheck = 1;
  cartData.forEach(function (item) {
    if (item.product.id === id) {
      numCheck = item.quantity += 1;
    }
  })
  const url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;
  const data = {
    data: {
      "productId": id,
      "quantity": numCheck
    }
  };
  axios.post(url, data, config)
    .then(function (response) {
      alert("加入購物車成功!!");
      getCartList();
    })
    .catch(function (error) {
      console.log(error.response.data);
    })
}



//刪除購物車邏輯
//刪除特定購物車內容
cartList.addEventListener('click', function (e) {
  let cartId = e.target.getAttribute('data-cartId');
  // console.log(cartId);
  if(cartId == null){
    return;
  }
  deleteCartItem(cartId);
})
function deleteCartItem(cartId) {
  axios.delete(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function (response) {
      alert(`商品已從購物車取出，請再次確認`);
      getCartList();
    })
    .catch(function (error) {
      console.log(error.response.data);
    })
}
//刪除購物車全部內容
deleteAllCart.addEventListener('click', function (e) {
  axios.delete(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      alert('購物車已清空，歡迎再次選購');
      getCartList();
    })
    .catch(function (error) {
      console.log(error.response.data);
      alert(`購物車內沒有商品，請先選購`);
    })
})


//送出訂單邏輯
sendOrder.addEventListener('click', function (e) {
  let cartLength = document.querySelectorAll('.cartList tr').length;
  if (cartLength == 0) {
    alert('購物車內無商品，請先選購!!');
    return;
  }

  let orderName = document.querySelector('.js-orderName').value;
  let orderTel = document.querySelector('.js-orderTel').value;
  let orderEmail = document.querySelector('.js-orderEmail').value;
  let orderAddress = document.querySelector('.js-orderAddress').value;
  let orderPayment = document.querySelector('.js-orderPayment').value;
  if (orderName == "" || orderTel == "" || orderEmail == "" || orderAddress == "") {
    alert('請填寫訂單資訊!!');
    return;
  }

  let orderData = {
    name: orderName,
    tel: orderTel,
    Email: orderEmail,
    address: orderAddress,
    payment: orderPayment
  }
  createOrder(orderData);

})

function createOrder(item) {
  axios.post(`${baseUrl}/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": item.name,
          "tel": item.tel,
          "email": item.Email,
          "address": item.address,
          "payment": item.payment
        }
      }
    }, headers)
    .then(function (response) {
      alert('訂單已成功建立，謝謝!')
      getCartList();
    })
}


//送出訂單資料欄驗證 (validate.js)
const constrains = {
  "姓名":{
    presence:{
      message:"為必填欄位!"
    }
  },
  "連絡電話":{
    presence:{
      message:"為必填欄位!"
    },
    length:{
      minimum:9,
      maximum:14,
      tooShort:"至少 9 碼(含)以上!",
      tooLong:"不能超過 14 碼!"
      }
    },
    "Email":{
      presence:{
        message:"為必填欄位!"
      },
      email:{
        message:"格式不正確!"
      }
    },
    "寄送地址":{
      presence:{
        message:"為必填欄位!"
      }
    }
  }

  const form = document.querySelector('.js-form');
  const input = document.querySelectorAll('input[type=text],input[type=tel],input[type=email],select');
  const validBtn = document.querySelector('.valid-btn');

  input.forEach((item) => {
    item.addEventListener('change',function(){
      //預設為空值
      item.nextElementSibling.textContent= "";

      //驗證回傳內容
      let errors = validate(form, constrains);
      //console.log(errors);

      //於網頁顯示
      if(errors){
        Object.keys(errors).forEach(function(keys){
          document.querySelector(`.${keys}`).textContent = errors[keys]
          //input 標籤的name和 p 標籤的class名相對應
          //以對應的p標籤來顯示 errors KEY的值
          //errors.姓名 => 姓名 為必填欄位!
        })
      }
    })
  })