const mongoose = require("mongoose");

var acordaoSchema = new mongoose.Schema({
    TribunalRecurso: String,
    Data: String,
    NDocumento: String,
    url: String,
    Tribunal: String,
    JurisprudenciaInternacional: String,
    JurisprudenciaNacional: String,
    JurisprudenciaEstrangeira: String,
    JurisprudenciaConstitucional: String,
    NConvencional: String,
    LegislacaoEstrangeira: String,
    AreaTematica: String,
    TextoIntegral: String,
    MeioProcessual: String,
    Votacao: String,
    ReferenciaPublicacao: String,
    IndicacoesEventuais: String,
    Magistrado:String,
    Processo: String,
    LegislacaoComunitaria: String,
    Sumario: String,
    LegislacaoNacional: String,
    Privacidade: String,
    Descritores: [String],
    Decisao: String,
    ProcessoTribunalRecurso: String,
    Requerido: String,
    AreaTematica1: String,
    AreaTematica2: String,
    ReferenciasInternacionais: String,
    Requerente: String,
    Acordao: String,
    OutraJurisprudencia: String,
    ReferenciaPareceres: String,
    Apenso: String,
    Recurso: String,
    Reclamacoes: String,
    ReferenciaPublicacao: String,
    DataAcordao: String,
    Objecto: String,
    Apendice: String,
    Relator: String,
    RecusaAplicacao: String,
    DataEntrada: String,
    Autor: String,
    Reu: String,
    Tema: String,
    ReferenciaProcesso: String,
    Doutrina: String,
}, { versionKey: false });

module.exports = mongoose.model('acordao', acordaoSchema);