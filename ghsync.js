const { Command } = require('commander');
const program = new Command();
const { exec } = require('child_process');
const { stdout } = require('process');

program
    .version('1.0.0')
    .description('test app')
    .argument('[source]', 'source directory, default is current directory', '.')
    .option('--public', 'create public repo')
    .option('-m, --message <message>', 'git commit message')
    .option('--private', 'create private repo')
    .option('-n, --name <name>', 'Specify the repository name, default is directory name')
    .option('--description <description>', 'Specify the repository description')
    .option('--owner <owner>', 'Specify the repository owner')
    .action((source, options) => {
        let { public: isPublic, private: isPrivate, message, name, description, owner } = options;
        if ((isPublic && isPrivate) || (!isPublic && !isPrivate)) {
            console.error('\x1b[31mError: Specify either --public or --private, not both or none. \x1b[0m\n');
            program.help();
        }
        //set visibility option
        let visibility;
        if (isPublic)
            visibility = '--public'
        else
            visibility == '--private'
        //if no name is provided use the folder name 
        if (!name) {
            name = process.cwd().split('\\')[process.cwd().split('\\').length - 1]
        }
        console.log(`Creating repository: ${name}`);
        description ? console.log(`Description: ${description}`) : "";
        owner ? console.log(`Owner: ${owner}`) : "";
        console.log(`Visibility: ${isPublic ? 'Public' : 'Private'}`);
        console.log(`source: ${source}`)
        //check if git exists
        exec('git status', (error, stdout, stderr) => {
            //if it doesnt, run >> git init && git add . && git commit -m "${message, default ="initial commit"}"
            if (error) {
                exec('git init', (error) => {
                    if (!error) {
                        exec('git add .', (error) => {
                            if (!error) {
                                message = message == undefined ? "initial commit" : message;
                                exec(`git commit -m "${message}"`, (error) => {
                                    console.log(error)
                                })
                            }
                        })
                    }
                    else
                        console.log(error)
                })
            }//if git exists and still message is present, run >> git add . && git commit -m "${message}" 
            else if (message) {
                exec('git add .', (error) => {
                    if (!error) {
                        exec(`git commit -m "${message}"`, (error) => {
                            console.log(error)
                        })
                    }
                })
            }
        })
        //after all the committing and everything
        exec(`gh repo create "${name}" ${visibility}`, (error, stdout, stderr) => {
            if (error)
                program.error(error);
            if (stdout) {
                let origin_path = stdout;
                exec('git branch -M main', (error) => {
                    if (!error)
                        exec(`git remote add origin ${origin_path}`, (error) => {
                            if (!error) {
                                exec('git push -u origin main', (error) => {
                                    if (error)
                                        console.log(error)
                                })
                            }
                        })
                })
            }
        })
    })

program.parse(process.argv);
