const openApiDocument = {
  openapi: '3.0.1',
  info: {
    title: 'Recruit.io API Reference',
    version: '1.0.0',
    description:
      'Documentação dos endpoints REST do Recruit.io, incluindo cadastros de usuários, perguntas, respostas e serviço de análise.',
  },
  servers: [{ url: 'http://localhost:3000' }],
  tags: [
    { name: 'Usuários', description: 'Cadastro e gerenciamento de usuários' },
    { name: 'Perguntas', description: 'CRUD de perguntas' },
    { name: 'Respostas', description: 'CRUD das respostas enviadas pelos candidatos' },
    { name: 'Analisar', description: 'Análise automática das respostas' },
    { name: 'Status', description: 'Verificação de saúde da API' }
  ],
  components: {
    schemas: {
      Erro: {
        type: 'object',
        properties: {
          erro: { type: 'string', description: 'Mensagem descritiva do problema' }
        }
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid' },
          nome: { type: 'string' },
          email: { type: 'string' },
          tipoUsuario: { type: 'string', enum: ['USER', 'RECRUITER'] }
        },
        required: ['id', 'nome', 'email', 'tipoUsuario'],
        example: {
          id: 'cku1b0xg80000x9l8v0h12345',
          nome: 'Maria Souza',
          email: 'maria@example.com',
          tipoUsuario: 'USER'
        }
      },
      UsuarioCreate: {
        type: 'object',
        required: ['nome', 'email', 'senha', 'tipoUsuario'],
        properties: {
          nome: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
          senha: { type: 'string', minLength: 6 },
          tipoUsuario: { type: 'string', enum: ['USER', 'RECRUITER'] }
        }
      },
      UsuarioLogin: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email' },
          senha: { type: 'string' }
        }
      },
      Pergunta: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid' },
          texto: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          usuarioId: { type: 'string', format: 'cuid' },
          dataCriacao: { type: 'string', format: 'date-time' },
          usuario: { $ref: '#/components/schemas/Usuario' }
        },
        required: ['id', 'texto', 'tags', 'dataCriacao']
      },
      PerguntaCreate: {
        type: 'object',
        required: ['texto', 'usuarioId'],
        properties: {
          texto: { type: 'string', minLength: 5 },
          tags: { type: 'array', items: { type: 'string' } },
          usuarioId: { type: 'string', format: 'cuid' }
        }
      },
      PerguntaUpdate: {
        type: 'object',
        properties: {
          texto: { type: 'string', minLength: 5 },
          tags: { type: 'array', items: { type: 'string' } }
        }
      },
      Resposta: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid' },
          candidato: { type: 'string' },
          resposta: { type: 'string' },
          perguntaId: { type: 'string', format: 'cuid' },
          usuarioId: { type: 'string', format: 'cuid' },
          dataCriacao: { type: 'string', format: 'date-time' },
          pergunta: { $ref: '#/components/schemas/Pergunta' },
          usuario: { $ref: '#/components/schemas/Usuario' }
        },
        required: ['id', 'candidato', 'resposta', 'perguntaId', 'dataCriacao']
      },
      RespostaCreate: {
        type: 'object',
        required: ['candidato', 'resposta', 'perguntaId', 'usuarioId'],
        properties: {
          candidato: { type: 'string', minLength: 1 },
          resposta: { type: 'string', minLength: 1 },
          perguntaId: { type: 'string', format: 'cuid' },
          usuarioId: { type: 'string', format: 'cuid' }
        }
      },
      AnaliseRequest: {
        type: 'object',
        required: ['respostaId', 'criterios'],
        properties: {
          respostaId: { type: 'string', format: 'cuid' },
          criterios: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'criatividade',
                'fora_da_caixa',
                'praticidade',
                'preocupacao_com_seguranca',
                'clareza',
                'aderencia_ao_tema',
                'esforco'
              ]
            },
            minItems: 1
          },
          contextoPergunta: { type: 'string' }
        }
      },
      AnaliseResultado: {
        type: 'object',
        additionalProperties: true,
        example: {
          respostaId: 'cku0s7m8p0000x9l8v0h2abc1',
          avaliacao: {
            criatividade: { nota: 8.5, comentario: 'Soluções alternativas interessantes.' },
            clareza: { nota: 9, comentario: 'Resposta bem estruturada.' }
          }
        }
      }
    }
  },
  paths: {
    '/': {
      get: {
        tags: ['Status'],
        summary: 'Mensagem de boas-vindas',
        responses: {
          200: {
            description: 'Confirma que a API está online',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string' } }
                }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        tags: ['Status'],
        summary: 'Checagem de saúde',
        responses: {
          200: {
            description: 'API disponível',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { ok: { type: 'boolean' } } }
              }
            }
          }
        }
      }
    },
    '/api/usuarios': {
      post: {
        tags: ['Usuários'],
        summary: 'Cria um novo usuário',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UsuarioCreate' } } }
        },
        responses: {
          200: { description: 'Usuário criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
          400: { description: 'Erro de validação', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      },
      get: {
        tags: ['Usuários'],
        summary: 'Lista todos os usuários',
        responses: {
          200: {
            description: 'Lista de usuários',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } } } }
          }
        }
      }
    },
    '/api/usuarios/login': {
      post: {
        tags: ['Usuários'],
        summary: 'Realiza login',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UsuarioLogin' } } }
        },
        responses: {
          200: {
            description: 'Login bem-sucedido',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensagem: { type: 'string' },
                    usuario: { $ref: '#/components/schemas/Usuario' }
                  }
                }
              }
            }
          },
          400: { description: 'Usuário não encontrado ou senha incorreta', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      }
    },
    '/api/usuarios/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'cuid' },
          description: 'Identificador do usuário'
        }
      ],
      get: {
        tags: ['Usuários'],
        summary: 'Busca usuário pelo ID',
        responses: {
          200: { description: 'Usuário encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
          400: { description: 'ID inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      },
      put: {
        tags: ['Usuários'],
        summary: 'Atualiza dados do usuário',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UsuarioCreate' } } }
        },
        responses: {
          200: { description: 'Usuário atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
          400: { description: 'Erro de validação', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Remove um usuário',
        responses: {
          200: { description: 'Usuário removido', content: { 'application/json': { schema: { type: 'object', properties: { sucesso: { type: 'boolean' } } } } } },
          400: { description: 'Erro ao remover', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      }
    },
    '/api/perguntas': {
      post: {
        tags: ['Perguntas'],
        summary: 'Cria uma pergunta',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PerguntaCreate' } } }
        },
        responses: {
          200: { description: 'Pergunta criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pergunta' } } } },
          400: { description: 'Usuário inexistente ou validação falhou', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      },
      get: {
        tags: ['Perguntas'],
        summary: 'Lista perguntas',
        responses: {
          200: {
            description: 'Perguntas cadastradas',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Pergunta' } } } }
          }
        }
      }
    },
    '/api/perguntas/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'cuid' }, description: 'Identificador da pergunta' }
      ],
      get: {
        tags: ['Perguntas'],
        summary: 'Busca pergunta por ID',
        responses: {
          200: { description: 'Pergunta encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pergunta' } } } },
          404: { description: 'Pergunta não encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          400: { description: 'ID inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      },
      put: {
        tags: ['Perguntas'],
        summary: 'Atualiza uma pergunta',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PerguntaUpdate' } } }
        },
        responses: {
          200: { description: 'Pergunta atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pergunta' } } } },
          400: { description: 'Erro de validação', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      },
      delete: {
        tags: ['Perguntas'],
        summary: 'Remove uma pergunta',
        responses: {
          200: { description: 'Pergunta removida', content: { 'application/json': { schema: { type: 'object', properties: { sucesso: { type: 'boolean' } } } } } },
          400: { description: 'Erro ao remover', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      }
    },
    '/api/respostas': {
      post: {
        tags: ['Respostas'],
        summary: 'Registra uma resposta',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RespostaCreate' } } }
        },
        responses: {
          200: { description: 'Resposta criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Resposta' } } } },
          400: { description: 'Validação falhou', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      },
      get: {
        tags: ['Respostas'],
        summary: 'Lista respostas',
        responses: {
          200: { description: 'Todas as respostas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Resposta' } } } } }
        }
      }
    },
    '/api/respostas/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'cuid' }, description: 'Identificador da resposta' }
      ],
      get: {
        tags: ['Respostas'],
        summary: 'Busca resposta por ID',
        responses: {
          200: { description: 'Resposta encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Resposta' } } } },
          404: { description: 'Resposta não encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          400: { description: 'ID inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      },
      delete: {
        tags: ['Respostas'],
        summary: 'Remove uma resposta',
        responses: {
          200: { description: 'Resposta removida', content: { 'application/json': { schema: { type: 'object', properties: { sucesso: { type: 'boolean' } } } } } },
          400: { description: 'Erro ao remover', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      }
    },
    '/api/respostas/pergunta/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'cuid' }, description: 'Pergunta alvo das respostas' }
      ],
      get: {
        tags: ['Respostas'],
        summary: 'Lista respostas de uma pergunta',
        responses: {
          200: { description: 'Respostas da pergunta', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Resposta' } } } } },
          400: { description: 'ID inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      }
    },
    '/api/analisar': {
      post: {
        tags: ['Analisar'],
        summary: 'Analisa uma resposta com IA',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AnaliseRequest' } } }
        },
        responses: {
          200: { description: 'Resultado da análise', content: { 'application/json': { schema: { $ref: '#/components/schemas/AnaliseResultado' } } } },
          400: { description: 'Erro na análise ou validação', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }
        }
      }
    },
    '/api/analisar/criterios': {
      get: {
        tags: ['Analisar'],
        summary: 'Critérios suportados para análise',
        responses: {
          200: {
            description: 'Lista de critérios',
            content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } }
          }
        }
      }
    }
  }
} as const;

export default openApiDocument;
