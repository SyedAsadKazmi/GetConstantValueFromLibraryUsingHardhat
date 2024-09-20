const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // Path to the compiled contracts output
    const compiledOutputPath = path.join(__dirname, "../artifacts/build-info");

    // Read the build info files
    const files = fs.readdirSync(compiledOutputPath);
    const buildInfoFile = path.join(compiledOutputPath, files[0]);

    const buildInfo = JSON.parse(fs.readFileSync(buildInfoFile, "utf8"));

    // Traverse through the output sources to find the AST
    const contracts = buildInfo.output.sources['contracts/TickMath.sol'];

    let minTickValue;
    let maxTickValue;

    if (contracts && contracts.ast) {
        const ast = contracts.ast;

        // Find MIN_TICK in the AST
        ast.nodes.forEach((node) => {
            if (node.nodeType === "ContractDefinition" && node.name === "TickMath") {
                node.nodes.forEach((subNode) => {
                    // Handle MIN_TICK value
                    if (subNode.nodeType === "VariableDeclaration" && subNode.name === "MIN_TICK") {
                        const valueNode = subNode.value;
                        if (valueNode.nodeType === "UnaryOperation" && valueNode.operator === '-') {
                            // MIN_TICK is negative
                            const literalValue = valueNode.subExpression.value;
                            minTickValue = `-${literalValue}`;
                        } else if (valueNode.nodeType === "Literal") {
                            // MIN_TICK is positive
                            minTickValue = valueNode.value;
                        }
                    }

                    // Handle MAX_TICK value (derived from MIN_TICK)
                    if (subNode.nodeType === "VariableDeclaration" && subNode.name === "MAX_TICK") {
                        const valueNode = subNode.value;
                        if (valueNode.nodeType === "UnaryOperation" && valueNode.operator === '-') {
                            // MAX_TICK is defined as -MIN_TICK
                            const referencedNode = valueNode.subExpression;
                            if (referencedNode.nodeType === 'Identifier' && referencedNode.name === 'MIN_TICK') {
                                maxTickValue = -minTickValue;
                            }
                        }
                        else if (valueNode.nodeType === 'Identifier' && valueNode.name === 'MIN_TICK') {
                            // MAX_TICK is defined as MIN_TICK
                            maxTickValue = minTickValue;

                        }
                    }
                });
            }
        });

        // Output the results
        if (minTickValue !== undefined) {
            console.log(`MIN_TICK found with value: ${minTickValue}`);
        } else {
            console.log("MIN_TICK not found.");
        }

        if (maxTickValue !== undefined) {
            console.log(`MAX_TICK found with value: ${maxTickValue}`);
        } else {
            console.log("MAX_TICK not found.");
        }
    } else {
        console.log("No AST found for the contract.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
