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


## **Base de dados**

A base de dados (mongodb) construída para a nossa aplicação contém 4 coleções: acordaos, tribunais, users e campos.

A coleção `acordaos` contém todos os acordãos do sistema.

A coleção `tribunais` contém as siglas de cada tribunal e o respetivo nome para que seja possível através da sigla obter o nome e vice-versa.

A coleção `users` contém a informação dos utilizadores, informação de autenticação e os favoritos de cada utilizador.

A coleção `campos` serve dois propósitos, com ela é possivel saber quais são os campos dos acordãos que são obrigatórios (para estes é necessário garantir que o utilizador os introduz) de forma dinâmica, é também usando esta coleção que fazemos a associação entre os nomes dos campos sem caracteres especiais e os nomes com estes caracteres (por ex: dataAcordao->Data do Acordão).

De forma a simplificar o máximo possível a execução da nossa aplicação, é incluido neste repositório um dump da base de dados separado em ficheiros binários de 40MB (o git não permite ficheiros maiores). O nosso compose irá utilizar este dump para criar uma nova base de dados.

## **Servidor de Autenticação**
O servidor de autenticação é responsável pela gestão dos utilizadores, criação de novas contas, autenticação dos utilizadores na aplicação, adição e remoção de favoritos.


No servidor de autenticação é criado o ***token*** (*jsonwebtoken*) sempre é feito um registo ou *login*. Esse *token* irá ficar guardado num *cookie* no *browser* do utilizador para que depois seja usado em todos os pedidos feitos pelo mesmo.

### **Rotas**

`GET /`: Devolve a lista de todos os utilizadores existente (apenas acessível para administradores).
`POST /registar`: Cria um novo utilizador e devolve um token.
`GET /login/facebook`: Efetua o login com a conta do Facebook.
`GET /login/facebook/callback`: Rota de callback para o login com Facebook e que devolve o token.
`GET /login/google`: Efetua o login com a conta do Google.
`GET /login/google/callback`: Rota de callback para o login com a conta Google e que devolve o token.
`GET /:id/favoritos`: Devolve a lista de favoritos do utilizador passado na rota. 
`GET /:id`: Devolve a informação do utilizador passado na rota (para que possa consultar o seu perfil). 
`POST /login`: Devolve um token caso o utilizador já tenha conta criada.
`PUT /:id`: Atualiza os dados do utilizador passado na rota.
`DELETE /:id`: Apaga os dados do utilizador passado na rota (apenas pode ser usada pelo próprio user ou por um administrador).
`POST /registaradmin`: Rota para registo de um administrador (apenas pode ser usada por outro administrador).
`POST /:id/favoritos`: Adiciona um novo acordão aos favoritos do utilizador passado na rota.
`DELETE /:id/favoritos/:favoritoId`: Apaga o acordão com id passado na rota dos favoritos do utilizador.



## **API**

`GET /acordaos/descritores`: Devolve a lista dos descritores existentes (a rota também recebe o número da página na interface e o número de elementos por página para que seja possível fazer paginação).
`GET /acordaos/search`: Devolve todos os acordãos correspondentes à pesquisa efetuada. A rota pode receber uma *query string* com diversos campos existentes nos acordãos. 
`GET /acordaos/count`: Devolve o número de acordãos correspondentes à pesquisa efetuada anteriormente.
`GET /acordaos/:id`: Devolve o acordão com o id passado na rota.
`POST /acordaos/`: Adiciona um novo acordão ao sistema (apenas um administrador pode aceder a esta rota),
`PUT /acordaos/:id`: Atualiza os dados do acordão passado na rota (apenas um administrador pode aceder a esta rota).
`DELETE /acordaos/:id`: Apaga os dados do acordão passado na rota (apenas um administrador pode aceder a esta rota).

`GET /campos/`: Devolve todos os campos existentes na coleção.
`POST /campos/`: Adiciona um novo campo.
`PUT /campos/:id`: Atualiza os dados do campo passado na rota.
`DELETE /campos/:id`: Remove os dados do campo passado na rota.

`GET /tribunais/`: Devolve os nomes de todos os tribunais.
`POST /tribunais/`: Adiciona um novo tribunal.
`PUT /tribunais/:id`: Atualiza o nome do tribunal passado na rota.
`DELETE /tribunais/:id`: Remove os dados do tribunal passado na rota.


## **Interface**
`GET /`:
`GET /logout`:
`GET /login`:
`POST /login`:
`GET /registar`:
`POST /registar`:
`GET /registar/admin`:
`POST /registar/admin`:
`GET /home`:
`GET /acordaos/adicionar`:
`POST /acordaos/adicionar`:
`POST /acordaos/adicionar/from-file`:
`GET /acordaos/remover/:id`:
`GET /acordaos/editar/:id`:
`POST /acordaos/editar/:id`:
`GET /acordaos/:id`:
`GET /acordaos/download/:id`:
`POST /users/:id/favoritos`:
`POST /users/:id/favoritos/:acordaoId/delete`:
`POST /search`:
`GET /search`:
`GET /perfil`:
`POST /perfil`:
`GET /perfil/delete`:
`GET /users`:
`GET /users/remover/:id`:
`GET /taxonomia`:
`GET /login/google`:
`GET /login/google/callback`:
`GET /login/facebook`:
`GET /login/facebook/callback`:
`GET /favoritos`:
`GET /tribunais`:


## **Demonstração do sistema**

### **Registo de conta**

### **Login**

### **Home**
mostrar tanto a view de user como de admin


### **Favoritos**

### **Taxonomia**

### **Perfil**

### **Tribunais**

### **Pesquisa**

### **Adicionar admin**
apenas admins

### **Consultar utilizadores**
apenas admins


## **Conclusão**


## **Correr o projeto**

Executar os comandos:

`git clone git@github.com:Vaz7/EngWebTrabalho2024.git`

`cd EngWebTrabalho2024`

`sudo docker-compose up --build`