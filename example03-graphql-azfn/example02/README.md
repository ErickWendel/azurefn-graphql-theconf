# Example

## Running

- docker-compose up --build
- Go to the browser

##

az group delete -n ew-graphql-sls
az group create -n ew-graphql-sls -l eastus
az storage account create --name ewsa007 --location eastus --resource-group ew-graphql-sls --sku Standard_LRS

az functionapp create \
 --resource-group ew-graphql-sls \
 --name graphql-serverless-app \
 --consumption-plan-location eastus \
 --runtime node \
 --storage-account ewsa007

func new --name graphql-az-app --template "HttpTrigger"

func azure functionapp publish graphql-serverless-app
