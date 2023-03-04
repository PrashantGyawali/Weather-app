const key="f43bfa6d597a49c6bb1145942230203";

class weatherday{
  constructor(a,b,c,d,e,f,g,h,i,j,k='none')
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
  }
}

let pastsearchresults=[];




$('#getsearchresults').click(
  function()
    {
      $('#results').html(`<button class="list-group-item pe-5">Searching...</button>`); 
      let t=$('#typingplace').val()
        console.log(t) ;
        console.log('hi');
        getsearchresults(t);

    }
);
  


async  function getsearchresults(name)
{
    let url=`http://api.weatherapi.com/v1/search.json?key=${key}&q=${name}`;
    
    if(!pastsearchresults[`${name}`])  // If the query is a duplicate request then dont bother fetching again
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

    else{ //If not a duplicate then fetch
      updateSearchList(pastsearchresults[`${name}`]);
    }


      function updateSearchList(results) //Fetch the data and create the list
      {
        $('#results').html('');
        results.forEach(
          (arr)=>
          {
            $('#results').append(`<button class="list-group-item resultItem pe-5">${arr.name},  ${arr.country}</button>`); 
          });
          $('.resultItem').click(
            function(){
              let t=this.innerText;
              $('#typingplace').val(t);
              // get_forecast(t);
              getAllresults(t);
              $('#results').html('');
            }
            )
      }
}









async function getAllresults(cityname)
{
  let forecasts= await get_forecast(cityname);
  console.log(forecasts);
  let history= await get_history(cityname);
  console.log(history);
  let current= await get_current(cityname);
  console.log(current);
  let finalarr=[...history,...forecasts,...current];
  console.log(finalarr);

  
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
        console.log(data)
        let temp= currentdaycreator(data);
        return  temp;
      } 
      catch (error) {
        // TypeError: Failed to fetch
        console.log('There was an error', error);
      }

function currentdaycreator(data) {
    let arrayofdays = [];

        arrayofdays.push(new weatherday(
            data.location.name,
            data.location.localtime,
            data.current.maxtemp_c,
            data.current.mintemp_c,
            data.current.avgtemp_c,
            data.current.feelslike_c,
            data.current.avghumidity,
            data.current.condition.text,
            data.current.condition.icon,
            data.location.localtime_epoch,
            data.current.is_day

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
console.log(today, ago);
let url=`http://api.weatherapi.com/v1/history.json?key=f43bfa6d597a49c6bb1145942230203&q=${cityname}&unixdt=${ago}&unixend_dt=${today}`;
    
    try {
        const response= await fetch(url);
        const data= await response.json();
        console.log('old weather',data);
        console.log('Location',data.location.name);
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
    let url=`http://api.weatherapi.com/v1/forecast.json?key=f43bfa6d597a49c6bb1145942230203&q=${cityname}&days=7`;
    
    
    try {
        const response= await fetch(url);
        const data= await response.json();
        console.log('forecast',data);
        let temp= dayscreator(data);
        return  temp;
      } 
      catch (error) {
        // TypeError: Failed to fetch
        console.log('There was an error', error);
      }

}