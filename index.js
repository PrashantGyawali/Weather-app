const key="f43bfa6d597a49c6bb1145942230203";
let n=0;
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

let pastsearchresults=[];
let presentresults=[];



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
    let url=`http://api.weatherapi.com/v1/search.json?key=${key}&q=${name}`;
    
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
              getAllresults(t,p);
              $('#results').html('');
            }
            )
      }
}









async function getAllresults(cityname,p)
{
  let forecasts= await get_forecast(cityname);
  let history= await get_history(cityname);
  let current= await get_current(cityname);
  let finalarr=[...history,...forecasts,...current];
  finalarr= await setnewarr(finalarr);
  finalarr=[...finalarr,p];


  presentresults.push(finalarr);   
   let create=createHTML(finalarr);
   create();
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
    let url=`http://api.weatherapi.com/v1/current.json?key=f43bfa6d597a49c6bb1145942230203&q=${cityname}`;  
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
let url=`http://api.weatherapi.com/v1/history.json?key=f43bfa6d597a49c6bb1145942230203&q=${cityname}&unixdt=${ago}&unixend_dt=${today}`;
    
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
    let url=`http://api.weatherapi.com/v1/forecast.json?key=f43bfa6d597a49c6bb1145942230203&q=${cityname}&days=8`;
    
    
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





let bookmarked=[];
      

  var b=[
    [
        {
            "city": "Kathmandu",
            "date": "2023-03-01",
            "maxtmp": 27.4,
            "mintmp": 10.1,
            "avgtmp": 20.3,
            "feelslike": "",
            "humidity": 34,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Wednesday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-02",
            "maxtmp": 27.2,
            "mintmp": 9.8,
            "avgtmp": 20.2,
            "feelslike": "",
            "humidity": 32,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Thursday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-03",
            "maxtmp": 29.4,
            "mintmp": 12.1,
            "avgtmp": 22.4,
            "feelslike": "",
            "humidity": 32,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Friday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-04",
            "maxtmp": 30.1,
            "mintmp": 12.6,
            "avgtmp": 23.1,
            "feelslike": "",
            "humidity": 31,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Saturday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-05",
            "maxtmp": 30.5,
            "mintmp": 12.8,
            "avgtmp": 23.3,
            "feelslike": "",
            "humidity": 30,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Sunday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-06",
            "maxtmp": 29.1,
            "mintmp": 12.4,
            "avgtmp": 22.2,
            "feelslike": 19,
            "humidity": 26,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Monday",
            "daynight": 0,
            "time": "19:00"
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-07",
            "maxtmp": 27.1,
            "mintmp": 10.4,
            "avgtmp": 17.8,
            "feelslike": "",
            "humidity": 24,
            "condition": "Cloudy",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/119.png",
            "day": "Tuesday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-08",
            "maxtmp": 27.8,
            "mintmp": 12.8,
            "avgtmp": 19,
            "feelslike": "",
            "humidity": 22,
            "condition": "Partly cloudy",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png",
            "day": "Wednesday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-09",
            "maxtmp": 30.5,
            "mintmp": 11.1,
            "avgtmp": 19,
            "feelslike": "",
            "humidity": 22,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Thursday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-10",
            "maxtmp": 31.1,
            "mintmp": 11.8,
            "avgtmp": 19.7,
            "feelslike": "",
            "humidity": 20,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Friday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-11",
            "maxtmp": 29.3,
            "mintmp": 13.4,
            "avgtmp": 20.1,
            "feelslike": "",
            "humidity": 21,
            "condition": "Partly cloudy",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png",
            "day": "Saturday",
            "daynight": "none",
            "time": ""
        }
    ],
    5,
    "27.72 85.32"
]

let a=[
    [
        {
            "city": "Kathmandu",
            "date": "2023-03-01",
            "maxtmp": 27.4,
            "mintmp": 10.1,
            "avgtmp": 20.3,
            "feelslike": "",
            "humidity": 34,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Wednesday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-02",
            "maxtmp": 27.2,
            "mintmp": 9.8,
            "avgtmp": 20.2,
            "feelslike": "",
            "humidity": 32,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Thursday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-03",
            "maxtmp": 29.4,
            "mintmp": 12.1,
            "avgtmp": 22.4,
            "feelslike": "",
            "humidity": 32,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Friday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-04",
            "maxtmp": 30.1,
            "mintmp": 12.6,
            "avgtmp": 23.1,
            "feelslike": "",
            "humidity": 31,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Saturday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-05",
            "maxtmp": 30.5,
            "mintmp": 12.8,
            "avgtmp": 23.3,
            "feelslike": "",
            "humidity": 30,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Sunday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-06",
            "maxtmp": 29.1,
            "mintmp": 12.4,
            "avgtmp": 22.2,
            "feelslike": 19,
            "humidity": 26,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Monday",
            "daynight": 0,
            "time": "19:00"
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-07",
            "maxtmp": 27.1,
            "mintmp": 10.4,
            "avgtmp": 17.8,
            "feelslike": "",
            "humidity": 24,
            "condition": "Cloudy",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/119.png",
            "day": "Tuesday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-08",
            "maxtmp": 27.8,
            "mintmp": 12.8,
            "avgtmp": 19,
            "feelslike": "",
            "humidity": 22,
            "condition": "Partly cloudy",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png",
            "day": "Wednesday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-09",
            "maxtmp": 30.5,
            "mintmp": 11.1,
            "avgtmp": 19,
            "feelslike": "",
            "humidity": 22,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Thursday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-10",
            "maxtmp": 31.1,
            "mintmp": 11.8,
            "avgtmp": 19.7,
            "feelslike": "",
            "humidity": 20,
            "condition": "Sunny",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/113.png",
            "day": "Friday",
            "daynight": "none",
            "time": ""
        },
        {
            "city": "Kathmandu",
            "date": "2023-03-11",
            "maxtmp": 29.3,
            "mintmp": 13.4,
            "avgtmp": 20.1,
            "feelslike": "",
            "humidity": 21,
            "condition": "Partly cloudy",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png",
            "day": "Saturday",
            "daynight": "none",
            "time": ""
        }
    ],
    5,
    "27.72 85.32"
];


function createHTML(a)
{

  let lat=(a[2]).slice(0,5);
  let lon=(a[2]).slice(5,11);

  function fn()
  {
    n++;
    $("#maindiv").prepend(`<div class="container col-6 mx-1 my-3 " id="eachcitycard${n}" style="min-width:300px; max-width:480px; border:none" ></div>`);
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
        `<span ${title} class="text-center"><div class="card eachcard textcolor" style=" border-radius: 16px; border:2px solid black; background-color: var(--bgcolor);
        ">
        <span class="textcolor" style="font-weight:600; ${temp};">${title.slice(7,-1)}</span>
        <div class="container heightofhead " >    
            <div class="container">
                <div class="text-center text-danger mt-3 h3 position-relative" id="cityname">
                    ${e.city}
                    <button class="rounded-circle position-absolute  border-0  bookmarkbtn" style="left:100%; transform: translateX(-50%); background:none;" onclick="togglebookmark('#eachcitycard${n}','${e.city}')"><i class="h3 bi bi-pin-angle bookmarkcolor text-end"></i></button>
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
          // responsive:true,
          slidesToShow: 1,
        });

    }

  return fn;

}




//localStorage.bookmarked
function togglebookmark(e,cityname)
{
  let x=$(e).find('.bookmarkbtn').find('i');
  if(x.hasClass('bi-pin-angle'))
  {
   x.addClass('bi-pin-angle-fill').removeClass('bi-pin-angle');
   bookmarked.push(cityname);
   localStorage.bookmarked=JSON.stringify(bookmarked);
  }
  else{
    x.removeClass('bi-pin-angle-fill').addClass('bi-pin-angle');
    bookmarked.splice(bookmarked.indexOf(cityname),1);
    localStorage.bookmarked=JSON.stringify(bookmarked);
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
