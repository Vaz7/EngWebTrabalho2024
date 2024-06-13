# Engenharia web - Base de dados de acordãos

## **Autores**
Gonçalo Duarte Lopes Marinho Gonçalves, A90969 <br/>
Henrique Almeida Vaz, A95533<br/>

## **Introdução**
Este relatório surge no âmbito da Unidade Curricular de Engenharia Web, em que nos foi proposto a concepção de uma aplicação *Web* de gestão e consulta de acórdãos.

### **Objectivos**
Na implementação desta aplicação *Web*, pretendemos atingir os seguintes objectivos:

- Criar uma interface *web* que possibilite a navegação em toda a informação disponibilizada.
- Permitir que a aplicação possibilite a criação, edição e remoção de acórdãos.
- Implementar um sistema de pesquisa robusto que permita encontrar facilmente os registos pretendidos.
- Permitir aos utilizadores guardar na sua conta os acórdãos que considerem relevantes para si (os seus favoritos).
- Construir uma taxonomia de termos a partir dos descritores dos acórdãos.


## **Tratamento dos *datasets***


1. Uniformização de campos escritos de forma diferente, mas com o mesmo significado (por exemplo, "Magistrado" e "Relator").
2. Eliminação de campos vazios (sem valores).
3. Eliminação de caracteres anormais (\t,\n) nos campos onde existiam.
4. Remoção de campos que estavam com formato errado (casos em que o texto integral tambem estava separado em campos), mantendo nestes casos apenas o texto integral.
5. Remoção de descritores inválidos.
6. Remoção da variável booleana que por vezes indicava a existencia do texto integral.


## **Servidor de Autenticação**
O servidor de autenticação é responsável pela gestão dos utilizadores, criação de novas contas, autenticação dos utilizadores na aplicação, adição e remoção de favoritos.


No servidor de autenticação é criado o ***token*** (*jsonwebtoken*) sempre é feito um registo ou *login*. Esse *token* irá ficar guardado num *cookie* no *browser* do utilizador para que depois seja usado em todos os pedidos feitos pelo mesmo.

### **Rotas**