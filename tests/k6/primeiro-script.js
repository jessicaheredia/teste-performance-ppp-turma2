import http from 'k6/http';
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { sleep, check, group } from 'k6';

export const options = {
  vus: 10,
  //interation: 1,
  duration: '20s',
  thresholds: {
    http_req_duration: ['p(90)<=2', 'p(95)<=3'], // 90% das requisições devem ser respondidas em menos de 2ms e 95% em menos de 3ms
    http_req_failed:['rate<0.01'] // Menos de 1% das requisições devem falhar
  }
};

export default function() {
  let responseInstructor = '';
  group('Login do Instrutor', function() {
    responseInstructor = http.post('http://localhost:3000/instructors/login', 
    JSON.stringify({
    email:"instrutor@instrutor.com", 
    password:"123456"
    }),
    {
        headers: { 'Content-Type': 'application/json' }
    })
  })
  
  group('Registrando uma nova lição', function() {
  let responseLesson = http.post('http://localhost:3000/lessons',
   JSON.stringify({
   title:"Como criar testes automatizados com k6", 
   description:"Criando testes de carga utilizando k6",
    }),
    {
        headers: { 'Authorization': `Bearer ${responseInstructor.json('token')}`, 'Content-Type': 'application/json' }
    })
    //console.log(responseLesson);
  check(responseLesson, { 
    "status deve ser igual a 201": (r) => r.status === 201
  });
  
  expect.soft(responseLesson.status).toBe(201);
  })
  sleep(1);
}