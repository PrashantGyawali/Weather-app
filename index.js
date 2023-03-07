const key="f43bfa6d597a49c6bb1145942230203";
let n=0;
let bookmarked=[];
let pastsearchresults=[];
let presentresults=[];



if(localStorage.bookmarked)
{
  

  bookmarked=JSON.parse(localStorage.bookmarked);

  if(bookmarked.length>0)
 {$('#maindiv').html(`<div class="text-center container h5 text-danger w-auto" id="bookmarkloading">Loading Bookmarks...</div>`);  
  bookmarked.forEach((e)=>{
    let t= getAllresults(e.cityname,e.pos,true);
    t.then(()=>{$( "#bookmarkloading" ).remove();})
  });
}



    localStorage.bookmarked=JSON.stringify(bookmarked);
    console.log(localStorage.bookmarked,bookmarked);
}


class weatherday{
  constructor(a,b,c,d,e,f,g,h,i,j,k='none',l='')
  {
    this.city=a;
    this.date=b; //data.forecast.forecastday[0].date
    this.maxtmp=c;
    this.mintmp=d;
    this.avgtmp=e;
    this.feelslike=f;
    this.humidity=g;
    this.condition=h;
    this.icon=i;
    this.day=(new Date(j*1000)).toLocaleDateString("en", {weekday: "long"});
    this.daynight=k; //night=0
    this.time=l;
  }
}




$('#getsearchresults').click(
  function()
    {
      $('#results').html(`<button class="list-group-item pe-5">Searching...</button>`); 
      let t=$('#typingplace').val()
        getsearchresults(t);

    }
);
  


async  function getsearchresults(name)
{
    let url=`https://api.weatherapi.com/v1/search.json?key=${key}&q=${name}`;
    
    if(!pastsearchresults[`${name}`])  //If not a duplicate then fetch
    {
    try {
       $('#searchresults').html('');
        const response= await fetch(url);
        const data= await response.json();
        console.log('Search Results',data);
        let temp={[`${name}`]:[...data]};
        pastsearchresults={...pastsearchresults,...temp};
        console.log(pastsearchresults)
        updateSearchList(data);
      } 
      catch (error) {
        // TypeError: Failed to fetch
        console.log('There was an error', error);
      };
    }

    else{ // If the query is a duplicate request then dont bother fetching again
      updateSearchList(pastsearchresults[`${name}`]);
    }


      function updateSearchList(results) //Fetch the data and create the list
      {
        $('#results').html('');
        results.forEach(
          (arr)=>
          {
            $('#results').append(`<button class="list-group-item resultItem pe-5" style="z-index=100" data-position="${arr.lat} ${arr.lon}">${arr.name},  ${arr.country}</button>`); 
          });
          $('.resultItem').click(
            function(){
              let t=this.innerText;
              let p=this.dataset.position;
              $('#typingplace').val(t);
              getAllresults(t,p,false);
              $('#results').html('');
            }
            )
      }
}









async function getAllresults(cityname,p,booked)
{
  if(!booked)
  {
    $('#maindiv').prepend(`<div class="h5 text-danger text-center w-25" id="Loadingdata">Loading Data...</div>`); 
  }
  let tmp=0;
  let index=0;
  presentresults.forEach((e,i)=>{if(e[2]==p){tmp=1; index=i}});
  if(tmp==0)
  {
  let forecasts= await get_forecast(cityname);
  let history= await get_history(cityname);
  let current= await get_current(cityname);
  let finalarr=[...history,...forecasts,...current];
  finalarr= await setnewarr(finalarr);
  finalarr=[...finalarr,p];

  presentresults.push(finalarr);   

   let create=createHTML(finalarr,booked);

   if(!booked){$( "#Loadingdata" ).remove();}
    create();
  }
  else{
    console.log('Nope result already here');
    let m=$(`#eachcitycard${index+1}`);
    move(m);
      function move(i){
        setTimeout(()=> {$("#maindiv").prepend(i);},0);
        console.log(i);
        i.remove();
        console.log(i);
    }
  }
}






function dayscreator(data)
{
  let arrayofdays=[];
for(let j=(0);j<(6);j++)
  { 
      arrayofdays.push(new weatherday(
      data.location.name,
      data.forecast.forecastday[j].date,
      data.forecast.forecastday[j].day.maxtemp_c,
      data.forecast.forecastday[j].day.mintemp_c,
      data.forecast.forecastday[j].day.avgtemp_c,
      '',
      data.forecast.forecastday[j].day.avghumidity,
      data.forecast.forecastday[j].day.condition.text,
      data.forecast.forecastday[j].day.condition.icon,
      data.forecast.forecastday[j].date_epoch,

      ));
  }

  return arrayofdays;
}


// Current
async function  get_current (cityname)
{
    let url=`https://api.weatherapi.com/v1/current.json?key=f43bfa6d597a49c6bb1145942230203&q=${cityname}`;  
    try {
        const response= await fetch(url);
        const data= await response.json();
        let temp= currentdaycreator(data);
        return  temp;
      } 
      catch (error) {
        // TypeError: Failed to fetch
        console.log('There was an error', error);
      }

function currentdaycreator(data) {
    let arrayofdays = [];
        arrayofdays.push( new weatherday(
          data.location.name,
          (String(data.location.localtime)).slice(0,10),
          data.current.maxtemp_c,
          data.current.mintemp_c,
          data.current.avgtemp_c,
          data.current.feelslike_c,
          data.current.avghumidity,
          data.current.condition.text,
          data.current.condition.icon,
          data.location.localtime_epoch,
          data.current.is_day,
        (String(data.location.localtime)).slice(11,16)
      ));
    return arrayofdays;
}
}


//Past
async function get_history(cityname)
{
  const msSinceEpoch = Math.floor((new Date()).getTime()/1000);
let today = msSinceEpoch ;
let ago=today-5*24*60*60;
let url=`https://api.weatherapi.com/v1/history.json?key=f43bfa6d597a49c6bb1145942230203&q=${cityname}&unixdt=${ago}&unixend_dt=${today}`;
    
    try {
        const response= await fetch(url);
        const data= await response.json();
        let temp= dayscreator(data);
        return  temp;
      } 
      catch (error) {
        // TypeError: Failed to fetch
        console.log('There was an error', error);
      }

}

// Forecast
async function get_forecast (cityname)
{
    let url=`https://api.weatherapi.com/v1/forecast.json?key=f43bfa6d597a49c6bb1145942230203&q=${cityname}&days=8`;
    
    
    try {
        const response= await fetch(url);
        const data= await response.json();
        let temp= dayscreator(data);
        return  temp;
      } 
      catch (error) {
        // TypeError: Failed to fetch
        console.log('There was an error', error);
      }

}

async  function setnewarr(a)
{
let current = "";
for(let i=0; i<a.length;i++)
{
    if(a[i] )
    {

        if(current && a[i].date==a[current].date)
        {
            a.splice(i,1);
        }
    
        if(a[a.length-1]!=undefined)
        {
            if(a[i].date==a[a.length-1].date)
        {
            a[i].daynight=a[a.length-1].daynight;
            a[i]['feelslike']=a[a.length-1]['feelslike'];
            a[i]['time']=a[a.length-1]['time'];
            if(current=="")
            {current=i;
                a.pop();
            }

        }

        }   
    }
   
}
return [a,current];
}



function createHTML(a,booked)
{
console.log(a);
  let lat=(a[2]).slice(0,5);
  let lon=(a[2]).slice(5,11);
  let filled='';
  let daynightbg=''
  if(booked)
  {
    filled='-fill';
  }

  if(a[0][a[1]].daynight==0)
  {
   daynightbg=`style="background-image:url('./images/night.jpg'); background-size:cover;"`
  }
  else{
    daynightbg=`style="background-image:url('./iamges/day.jpg'); background-size:cover;"`
  }

  function fn()
  {
    n++;
    $("#maindiv").prepend(`<div class="container col-6 mx-1 my-3 " id="eachcitycard${n}" style="min-width:300px; max-width:480px; border:none"></div>`);
    a[0].forEach(
     (e)=> {
  
      let temp =" ";
      let title='1111111111';

      if (e.feelslike=='')
      {
        temp="opacity:0;";
      }
      if(e.feelslike!='')
      {
        title='title="Today"';
      }


      $(`#eachcitycard${n}`).append(
        `<span ${title} class="text-center"><div class="card eachcard textcolor" style=" border-radius: 16px; border:3px solid black; background-color: var(--bgcolor);
        ">

        <div class="container heightofhead" ${daynightbg} >    
        <span class="textcolor" style="font-weight:600; ${temp};">${title.slice(7,-1)}</span>
            <div class="container">
                <div class="text-center text-danger mt-3 h3 position-relative" id="cityname">
                    ${e.city}
                    <button class="rounded-circle position-absolute  border-0  bookmarkbtn" style="left:100%; transform: translateX(-50%); background:none;" id="card${n}bookmark" onclick="togglebookmark('#eachcitycard${n}','${e.city}','${a[2]}')"><i class="h3 bi bi-pin-angle${filled} bookmarkcolor text-end"></i></button>
                </div>
  
            </div>
                <h5 class="text-center text-warning" id="date">${e.date}</h4>
                <h6 class="text-center text-primary" id="day">${e.day}</h4> 
        </div>
  
  
        <div class="card-body pb-sm-5 pt-sm-3 px-sm-1 p-2 heightofbody" >
            <div class="container m-0 px-1 d-sm-flex justify-content-between text-center">
                <div class="conatiner  ps-0 m-0">
                    <h5 class="card-title mb-2 text-center textcolor">${e.condition}</h5>
                    <div class="d-flex justify-content-center mb-2 textcolor"><p><img src="${e.icon}" alt=""></p></div>
                    <div class="h6 text-center m-0 textcolor"  id="feelslike" style="${temp}">Feels like: ${e.feelslike}°C</div>
                </div>
                <div class=" d-flex  flex-column" style="overflow:hidden">
                    <div id="avgtemp" class="textcolor">Avg Temp: ${e.avgtmp}°C</div>
                    <div id="mintemp" class="textcolor">Min Temp: ${e.mintmp}°C</div>
                    <div id="maxtemp" class="textcolor">Max Temp: ${e.maxtmp}°C</div>
                    <div id="humidity" class="textcolor">Humidity: ${e.humidity}%</div>
                    <div id="long" class=" text-sm-center textcolor"><span title="Longitude">Lon: ${lon}</span> </div>
                    <div id="lat" class="text-sm-center textcolor"><span title="Latitude">Lat: ${lat}</span></div> 
  
                </div>
            </div>
        </div>
      </div></span>`
      );

    }
    )

  
          $(`#eachcitycard${n}`).slick({
          arrows:false,
          infinite: false,
          autoplay:false,
          adaptiveHeight: false,
          dots:true,
          initialSlide:a[1],
          slidesToShow: 1,
        });

    }

  return fn;

}




//localStorage.bookmarked
function togglebookmark(e,cityname,pos)
{
  let x=$(e).find('.bookmarkbtn').find('i');

  if(x.hasClass('bi-pin-angle') && bookmarked.filter((m)=>{return m.cityname==cityname}).length==0)
  {
   x.addClass('bi-pin-angle-fill').removeClass('bi-pin-angle');
   bookmarked.push({'cityname':cityname, 'pos':pos});
   localStorage.bookmarked=JSON.stringify(bookmarked);
   console.log(localStorage.bookmarked, bookmarked)
  }
  else{
    x.removeClass('bi-pin-angle-fill').addClass('bi-pin-angle');
    bookmarked.splice(bookmarked.indexOf({'cityname':cityname, 'pos':pos}),1);
    localStorage.bookmarked=JSON.stringify(bookmarked);
    console.log(localStorage.bookmarked, bookmarked)
  }
}

function togglecolor()
{
    let r = document.querySelector(':root');
    let x=document.getElementById('darkmodeswitch').checked;
    if(!x)
    {
        r.style.setProperty('--txtcolor', '#28242c');
        r.style.setProperty('--backgroundcolor', 'rgba(255,255,255,1)');
        r.style.setProperty('--bookmarkcolor', '#dc3545');
        r.style.setProperty('--bgcolor', 'rgb(233,233,233)');
    }
    else {
        r.style.setProperty('--txtcolor', '#ffffff');
        r.style.setProperty('--backgroundcolor', '#1d1d1d');
        r.style.setProperty('--bookmarkcolor', '#ffffff');
        r.style.setProperty('--bgcolor', '#28242c');
    }

}
