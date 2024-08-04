/*
// Test git. 

                       P ( C | A ) * P ( A )
    P ( A | C ) =   --------------------------
                                P ( C )



                                
                                      'Likelyhood' model predicts data * 'Prior' - model is accurate
    'Posterior Probability': degree  = ------------------------------------------------------------------
    to believe model desc this        'Normalizing' constant: make posterior density=1
    situation given prior
    data

    Numbers via this youtube: https://www.youtube.com/watch?v=CPqOCI0ahss&t=98s

    */




   function getLookup(dataset, keys, target) { 
    let p = {} 
    let index = -1
    keys.forEach((key,i)=>{
        p[key]={}
        if ( key == target ) {
            index = i
        }
    })

    for ( let i = 1; i < dataset.length; i++) { 
        let row = dataset[i]
        let value = row[index]
        if ( ! p[target].hasOwnProperty(value)) {
            p[target][value]=0
        }
        p[target][value]++
    }

    const delimit = "____"
    for ( let i = 1; i < dataset.length; i++) { 
        let row = dataset[i]
        let targetState = row[index]
        for ( let j = 0; j < row.length; j++) {
            let feature = keys[j]
            let state = row[j]
            if ( j != index ) {
                let compoundState = state + delimit + targetState
                if ( ! p[feature].hasOwnProperty(compoundState)) { 
                    p[feature][compoundState]=0
                }
                p[feature][compoundState]++
            }
        }
    }
    return p 
}

function getP(find, lookup, target, targetFeature, targetTotal,denomoinator) {
    let p = 0 
    find.forEach((x,i)=>{
        let feature = x[0]
        let state = x[1]
        if ( i == 0 ) {
            p = lookup[feature][state] / denomoinator
        } else { 
            p *= ( lookup[feature][state] / denomoinator ) 
        }
        //console.log( lookup[feature][state] + " feature: " + feature + "  state: " + state )
    })  
    p *= ( lookup[target][targetFeature] / targetTotal )
    return p
}

function getEvidence(find, lookup, total) {
    let p = 0 
    find.forEach((ary, i)=>{
        let feature = ary[0]
        let state1 = ary[1]
        let state2 = ary[2]
        let both = lookup[feature][state1] + lookup[feature][state2]
        if ( i == 0 ) {
            p = (both / total )
        } else {
            p *= (both / total )
        }
        //console.log( "feature: " + feature + "   " +   both + " / " + total )
    })
    return p 
}


if (require.main === module) {
    // Self test! 
    function verdict(actual, expected, msg ) { 
        const a_tiny_amount = 0.01
        if ( actual >= ( expected - a_tiny_amount ) || actual <= ( expected + a_tiny_amount ) ) {
            // Close enough! 
            console.log( "PASS " + msg + " " + actual )
        } else { 
            console.log( "FAIL " + msg + " actual: " + actual + " expected " + expected )
        }
    }


    // pretend this came from a csv or RESTful endpoint or something.
    const dataset = [
    ["outlook","temperature","humidity","windy","play"],
    ["sunny","hot","high","f","no"],
    ["sunny","hot","high","t","no"],
    ["overcast","hot","high","f","yes"],
    ["rainy","mild","high","f","yes"],
    ["rainy","cool","normal","f","yes"],
    ["rainy","cool","normal","t","no"],
    ["overcast","cool","normal","t","yes"],
    ["sunny","mild","high","f","no"],
    ["sunny","cool","normal","f","yes"],
    ["rainy","mild","normal","f","yes"],
    ["sunny","mild","normal","t","yes"],
    ["overcast","mild","high","t","yes"],
    ["overcast","hot","normal","f","yes"],
    ["rainy","mild","high","t","no"]
    ]
    const keys = dataset[0]
    const total = dataset.length - 1
    const target = "play"
    let lookup = getLookup(dataset, keys, target)

    const findYes = [ 
        ["outlook","sunny____yes"],
        ["temperature","cool____yes"],
        ["humidity","high____yes"],
        ["windy","t____yes"],
    ]
    let A = getP(findYes, lookup, target, "yes", total,lookup["play"]["yes"])

    const findNo = [ 
        ["outlook","sunny____no"],
        ["temperature","cool____no"],
        ["humidity","high____no"],
        ["windy","t____no"],
    ]
    let B = getP(findNo, lookup, target, "no", total, lookup["play"]["no"])

    verdict( 0.0052, A, "1 of 5 : Pre-normalization: the positive condition is ")
    verdict( 0.02, B, "2 of 5 : Pre-normalization: the negative condition is ")

    const findTotals = [
            ["outlook","sunny____yes", "sunny____no"],
            ["temperature","cool____yes","cool____no"],
            ["humidity","high____yes","high____no"],
            ["windy","t____yes","t____no"],
    ] 

    const C = getEvidence(findTotals, lookup, total)
    verdict(0.21,C,"3 of 5 : Normalizing constant: ")
    A = A / C
    B = B / C
    verdict(0.24,A,"4 of 5 : The probability of play:")
    verdict(0.94,B,"5 of 5 : The probability of no-play: ")

    let outcome = B/A 
    console.log( outcome + " more likely to not play than to play")  

}
