# Welcome to Knowledge Based Engine

This is a simple POC project to demonstrate highly available and highly extensible question-answer mechanism which then returns the user the fully matched result (known as template) based on the answer responses. It eliminates the need for code to incorporate questioning logic a.k.a rules (determining what is the next question based on certain response, complex if-else to return matching result etc). The segregation separates the question, rules and templates from the code which eliminates the need for re-deployment for every change related to question, rule or even template.

## Issues and Considerations

What this design/solution considers:

-   High availability (serverless architecture)
-   Extensibility (easily extend from the existing question, rule and template sets)
-   Auto-scalability
-   Resiliency
-   Cost
-   High performance (leverage on indexed hash columns on database for quicker querying)
-   Features:
    -   API to seed initial data (questions, rules, and templates)
    -   API to query for the next question based on answer response
    -   API to return the matching result based on answer responses

## Pre-requisites

WIP

### Tools to be installed on your machine:

-   **[NodeJS](https://nodejs.org/en)** (version `20.0.0` preferred)
-   **[Docker & Kubernetes](https://www.docker.com/products/docker-desktop/)**
-   **[AWS CLI](https://aws.amazon.com/cli/)** (version > `2.9` preferred)
-   **[AWS CDK](https://aws.amazon.com/cdk/)** (optional)
-   Windows OS (preferred) or Linux (Ubuntu)

## Pre-run: Cloning Project and Installing Dependencies

WIP

## Running the application

WIP