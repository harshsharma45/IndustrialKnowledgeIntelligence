import { convertToModelMessages } from 'ai';

async function test() {
  const uiMessages = [
    {
      id: '1',
      role: 'user',
      content: '', 
      parts: [{ type: 'text', text: 'Hello' }],
    },
    {
      id: '2',
      role: 'assistant',
      content: '',
      parts: [
        { type: 'text', text: 'Here is info:' },
        { 
          type: 'tool-invocation', 
          toolInvocation: {
            toolCallId: 'call_1',
            toolName: 'search_industrial_knowledge',
            args: { query: 'test' },
            state: 'result',
            result: 'some results'
          }
        }
      ]
    }
  ];
  
  try {
    const core = await convertToModelMessages(uiMessages);
    console.log(JSON.stringify(core, null, 2));
  } catch(e) {
    console.error(e);
  }
}

test();
