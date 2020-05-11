import axios from 'axios';
import cheerio from 'cheerio';

let api = {
    getList: (pageNo,cb,search=false,term="") => {
        let arr1=[], arr2=[], arr=[];
        let url;
        if(search){
            url = `https://wallpaperscraft.com/search/?order=&page=${pageNo}&query=${term}&size=`;
        }
        else{
            url = `https://wallpaperscraft.com/all/page${pageNo}`
        }
        axios.get(url)
          .then(response => {
              const $ = cheerio.load(response.data);
              $('img.wallpapers__image').each((index,ele) => {
                  let element = $(ele);
                  arr1.push(element.attr('src'));
              })
              $('a.wallpapers__link').each((index,ele) => {
                let element = $(ele);
                arr2.push(element.attr('href'));
            })

              for(let i=0;i<arr1.length;i++)  arr.push([arr1[i], arr2[i]]);
              return arr;
            
          })
          .then(arr => {
              let cond = true;
              if(arr.length <2){
                  cond = false;
              }
              cb(arr,cond);
          })
          .catch(error => {
              console.log(error);
          })
    },
    search: (term, cb) => {
        let arr1=[], arr2=[], arr=[];
        axios.get(`https://wallpaperscraft.com/search/?order=&page=1&query=${term}&size=`)
            .then(response => {
                const $ = cheerio.load(response.data);
                $('img.wallpapers__image').each((index,ele) => {
                    let element = $(ele);
                    arr1.push(element.attr('src'));
                })
                $('a.wallpapers__link').each((index,ele) => {
                let element = $(ele);
                arr2.push(element.attr('href'));
            })

                for(let i=0;i<arr1.length;i++)  arr.push([arr1[i], arr2[i]]);
                return arr;
            
            })
            .then(arr => {
                if(arr.length == 0)  cb(arr,true)
                else  cb(arr,false);
            })
            .catch(error => {
                console.log(error);
            })
    }
}

export default api;