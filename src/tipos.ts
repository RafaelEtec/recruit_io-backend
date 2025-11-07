export type Criterio =
  | "criatividade"
  | "fora_da_caixa"
  | "praticidade"
  | "preocupacao_com_seguranca"
  | "clareza"
  | "aderencia_ao_tema"
  | "esforco";

export interface RequisicaoAnalise {
  respostaId: string;
  criterios: Criterio[];
  contextoPergunta?: string;
}

export interface ResultadoAnalise {
  overall: number;
  scores: Record<Criterio, number>;
  labels: {
    destaque?: "mais_criativo" | "mais_pratico" | "mais_seguro" | "mais_fora_da_caixa";
    possivel_baixo_esforco?: boolean;
    possivel_fora_do_tema?: boolean;
  };
  notes: string[];
}