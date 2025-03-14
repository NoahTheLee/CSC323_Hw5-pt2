//This creates carts to be ingested
const axios = require('axios');
const { execSync } = require('child_process');

async function pokeHttp() {

    try {
        const token = execSync('gcloud auth print-identity-token', { encoding: 'utf8' }).trim();
        //Point this at your cartGenerator function
        const url = 'https://commerce-cart-generator-514354429003.us-west2.run.app';

        const headers = {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'application/json',
        };

        //Change numruns to the number of carts you want generated
        const numruns = 20;
        for (let i = 0; i < numruns; i++) {
            let response = await axios.get(url, { headers });
            console.log(response.data);
        }

    } catch (error) {
        console.error(error);
    }
}

pokeHttp()