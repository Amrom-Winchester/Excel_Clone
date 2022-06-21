let rowNumberSection = document.querySelector(".row-number-section");

let formulaBarSelectedCellArea = document.querySelector(".selected-cell-div");
let lastcell;
let dataObj = {};

let formulaInput = document.querySelector(".formula-input-section");
let cellSection = document.querySelector(".cell-section");
let columnTagsSection = document.querySelector(".column-tag-section");

formulaInput.addEventListener("keydown",function(e){
  if(e.key=="Enter"){

    let typedFormula = e.currentTarget.value

    if(!lastcell){
      return;
    }

    let selectedCell = lastcell.getAttribute("data-address");
    let cellobj = dataObj[selectedCell];

    cellobj.formula = typedFormula;

    let currUpstream = cellobj.upstream;
    for( let i = 0; i<currUpstream.length; i++ ){

      // removeFromDownstream(parent,child)
       removeFromDownstream( currUpstream[i],currCellAddress);
       
    }
    cellobj.upstream = [];
    console.log(typedFormula);

    let formulaArray = typedFormula.split(" ");

    // filling all new cells which are present in the formula
    for( let i = 0; i<formulaArray.length; i++ ){
      let st = formulaArray[i];
      console.log(st);
      if(st=='*' || st=='+' || st=='-' || st=='/' || isNaN(st)==false ){
        continue;
      }
      cellobj.upstream.push(formulaArray[i]);
    }

    for( let i = 0; i<cellobj.upstream.length; i++ ){
      addToDownstream(cellobj.upstream[i],selectedCell);
    }

    dataObj[selectedCell] = cellobj;

    updateCell(selectedCell);
  }
});

cellSection.addEventListener("scroll",function(e){
    let rowTrans = e.currentTarget.scrollTop;
    let columnTrans = e.currentTarget.scrollLeft;
    rowNumberSection.style.transform = `translateY(-${rowTrans}px)`;
    columnTagsSection.style.transform = `translateX(-${columnTrans}px)`;
})

for (let i = 1; i <= 100; i++) {
  let div = document.createElement("div");
  div.innerText = i;
  div.classList.add("row-number");
  rowNumberSection.append(div);
}


for (let i = 0; i < 26; i++) {
  let asciiCode = 65 + i;

  let reqAlphabet = String.fromCharCode(asciiCode);

  let div = document.createElement("div");
  div.innerText = reqAlphabet;
  div.classList.add("column-tag");
  columnTagsSection.append(div);
}

// inside this nested for loop we are creating individual cells UI + cell Obj
for (let i = 1; i <= 100; i++) {
  let rowDiv = document.createElement("div");
  rowDiv.classList.add("row");
                       //i = 1 [A1,B1..........Z1]
                       //i = 2 []
                       //.
                       //.
                       //i = 100 [A100.........z100]

  for (let j = 0; j < 26; j++) {       //i = 100   j = 25  asciiCode = 65+25=90  alpha = z  cellAdd = Z100
    // A to Z
    let asciiCode = 65 + j;
    let reqAlphabet = String.fromCharCode(asciiCode);
    let cellAddress = reqAlphabet + i;

    dataObj[cellAddress] = {
      value : undefined,
      formula : undefined,
      upstream : [],
      downstream : [],
    };

    let cellDiv = document.createElement("div");

    cellDiv.addEventListener("input",function(e){
      // jis cell pr type kra uske attribute se maine uska cell address fetch kra
      let currCellAddress = e.currentTarget.getAttribute("data-address");

      //kuki sare cell objects dataObj me store ho rakhe h using their cell address as key
      //maine jis cell pr click krke type kra uska hi address fetch and uska hi object chahiye
      //to wo address as key use krke dataObj se fetch krlia req cellObj ko
      let currCellObj = dataObj[currCellAddress];
      currCellObj.value = e.currentTarget.innerText;
      currCellObj.formula = undefined;

      //1- Loop on upstream
      //2- for each cell go to its downstream and remove ourself
      //3- apni upstream ko empty array krdo
      let currUpstream = currCellObj.upstream;
      for( let i = 0; i<currUpstream.length; i++ ){

        // removeFromDownstream(parent,child)
        removeFromDownstream( currUpstream[i],currCellAddress);
        
      }
      currCellObj.upstream = [];

       // C1(20) => [E1]  E1 (2*C1) [40]
      let currDownStream = currCellObj.downstream;
      for( let i = 0; i<currDownStream.length; i++ ){
        updateCell(currDownStream[i]);
      }
      dataObj[currCellAddress] = currCellObj;
      console.log(dataObj);

    })

    cellDiv.setAttribute("contenteditable",true);
    // contentEditable = true

    cellDiv.classList.add("cell");

    cellDiv.setAttribute("data-address", cellAddress);
    cellDiv.addEventListener("click",function(e){
        if( lastcell ){
            lastcell.classList.remove("cell-selected");
        }
        e.currentTarget.classList.add("cell-selected");
        lastcell = e.currentTarget;

        let currCellAddress = e.currentTarget.getAttribute("data-address");
        formulaBarSelectedCellArea.innerText = currCellAddress;
    });
    rowDiv.append(cellDiv);
  }

  cellSection.append(rowDiv)

}

dataObj["A1"].value = 20;
dataObj["A1"].downstream = ["B1"];
dataObj["B1"].formula = "2 * A1";
dataObj["B1"].upstream = ["A1"];
dataObj["B1"].value = 40;

let a1cell = document.querySelector("[data-address='A1']");
let b1cell = document.querySelector("[data-address='B1']");

a1cell.innerText = 20;
b1cell.innerText = 40;

//is function kisi ki upstream se mtlb nhi hai
//iska bs itna kaam h ki parent do and child do , aur mai parent ki downstream se child ko hta dunga
//taki unke bichka connection khtm hojai
//taki agr parent update ho to connection khtm hone ke baad child update na ho
function removeFromDownstream( parentCell , childCell ){
  //1- fetch parentCell's downstream
  let parentDownStream = dataObj[parentCell].downstream;

  //2- filter kro childCell ko parent ki downstream se
  let filteredDownstream = [];
  for( let i = 0; i<parentDownStream.length; i++ ){
    if(parentDownStream[i]!=childCell){
      filteredDownstream.push(parentDownStream[i]);
    }
  }

  //3- filtered upstream ko wapis save krwado dataObj me req cell me
  dataObj[parentCell].downstream = filteredDownstream;    
}

function updateCell(cell){
  let cellObj = dataObj[cell];
  let upstream = cellObj.upstream;
  let formula = cellObj.formula;

  // upstream me jobhi cell hai unke objects me jaunga wahan se unki value lekr aunga 
  // wo sari values mai ek object me key value pair form me store krunga where key being the cell address

  // Example :
  // {
  //   A1:20,
  //   B1:10
  // }

  let valObj = {};
  for( let i = 0; i<upstream.length; i++ ){
    let cellValue = dataObj[upstream[i]].value;
    valObj[upstream[i]] = cellValue;
  }

  //a1 + b1
  for( let key in valObj){
    formula = formula.replace(key,valObj[key]);
  }

  //20 + 10
  let newValue = eval(formula);

  dataObj[cell].value = newValue;

  // to update those who are further depended on values which are being updated
  let downStream = cellObj.downstream;
  for( let i = 0; i<downStream.length; i++ ){
    updateCell(downStream[i]);
  }

  let uicell = document.querySelector(`[data-address='${cell}']`);
  uicell.innerText = dataObj[cell].value;
}

function addToDownstream( parent , child ){
  dataObj[parent].downstream.push(child);
}