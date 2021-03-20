import config from '../../config/config.json';
import axios from 'axios';

/*
Mark product data in database which fulfills the following criteria as OBSOLETED,
and also update the server API SQL query to return non-obsoleted product only.
*/

export const getProduct = () => {

    return axios.get(config.SERVER_ENDPOINT + '/product')
                .then((res) => {

                 const out = res.data.data.filter(item => item.type != 'A')
                 return out.filter(item => item.price > 20)

                }).catch((err) => {
                    console.log("API ERROR");
                });
}