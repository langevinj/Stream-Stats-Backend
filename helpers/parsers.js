const fs = require("fs");

//helper function for parsing a raw distrokid page
async function distrokidParser(rawData){   
    //write a new .txt file for the raw data
    await fs.writeFile(`./rawPages/distrokid.txt`, rawData, 'utf8', (err) => {
        if (err) throw err;
    });

    let formattedArray = [];
    //read the file in as an array line by line
    await fs.readFile('./rawPages/distrokid.txt', function (err, data) {
        if (err) throw err;

        //trim extra '100% of team' on each line
        const rawArray = data.toString().split("\n").filter(line => !line.includes("100% of team"));
        
    });

}

//helper function for writing a given set of rawData to a .txt file
// async function writeFile(rawData, title){
//     await fs.writeFile(`./rawPages/${title}`, rawData, 'utf8', (err) => {
//         if (err){
//             throw err;
//         } else {
//             return 1
//         }
//     });
// }
// 

async function testRead(){
    let rawArray = [];
    await fs.readFile('../rawPages/distrokid.txt', function (err, data) {
        if (err) throw err;
        rawArray = data.toString().split("\n").filter(line => !line.includes("100% of team")
        );
    });
    
}


let res = testRead();
res.then((value) => {
    console.log(value)
})
// export default distrokidParser