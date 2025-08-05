import {
    SmartToy as BotIcon,
    Close as CloseIcon,
    Person as PersonIcon,
    Refresh as RefreshIcon,
    Send as SendIcon
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Fab,
    Fade,
    IconButton,
    TextField,
    Typography,
    Zoom,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ChatbotTutorial = ({ organism, open, onClose }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState('greeting');
  const [userProfile, setUserProfile] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      addBotMessage(getGreetingMessage());
    }
  }, [open]);

  const addBotMessage = (message, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'bot',
          content: message.text,
          suggestions: message.suggestions,
          timestamp: new Date(),
        }
      ]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        content: text,
        timestamp: new Date(),
      }
    ]);
  };

  const getGreetingMessage = () => ({
    text: `Hi! I'm AMRnet Assistant 🤖 I'm here to help you understand antimicrobial resistance data.

To get started, could you tell me what best describes you?`,
    suggestions: [
      '👩‍⚕️ Healthcare Professional',
      '🏛️ Public Health Official',
      '🔬 Researcher/Student',
      '📚 General Learner'
    ]
  });

  const getResponseFlow = (userInput, currentFlow) => {
    const input = userInput.toLowerCase();

    switch (currentFlow) {
      case 'greeting':
        if (input.includes('healthcare') || input.includes('doctor') || input.includes('nurse')) {
          setUserProfile({ type: 'clinician' });
          setCurrentFlow('clinician-intro');
          return {
            text: `Great! As a healthcare professional, you'll want to know how AMRnet can help with treatment decisions.

${organism ? `Let's explore ${getOrganismName(organism)} data.` : ''} What would you like to learn about first?`,
            suggestions: [
              '🗺️ How to read the map',
              '💊 Understanding resistance patterns',
              '📊 Interpreting trends',
              '🔍 Finding local data'
            ]
          };
        } else if (input.includes('public health') || input.includes('epidemiologist')) {
          setUserProfile({ type: 'public-health' });
          setCurrentFlow('public-health-intro');
          return {
            text: `Perfect! For public health surveillance, AMRnet helps track resistance trends and inform policy decisions.

What aspect of surveillance interests you most?`,
            suggestions: [
              '📈 Tracking trends over time',
              '🌍 Regional comparisons',
              '📋 Policy applications',
              '⚠️ Identifying hotspots'
            ]
          };
        } else if (input.includes('researcher') || input.includes('student')) {
          setUserProfile({ type: 'researcher' });
          setCurrentFlow('researcher-intro');
          return {
            text: `Excellent! AMRnet is a great resource for research and education.

What type of analysis are you interested in?`,
            suggestions: [
              '📊 Data download options',
              '🧬 Understanding genotypes',
              '🔬 Research applications',
              '📚 Educational use'
            ]
          };
        } else {
          setUserProfile({ type: 'general' });
          setCurrentFlow('general-intro');
          return {
            text: `Welcome! I'll help you understand antimicrobial resistance in simple terms.

Let's start with the basics. What would you like to learn?`,
            suggestions: [
              '🦠 What is AMR?',
              '🗺️ How to use the map',
              '📈 Why track resistance?',
              '💡 Key concepts'
            ]
          };
        }

      case 'clinician-intro':
        if (input.includes('map')) {
          return getMapExplanation('clinician');
        } else if (input.includes('resistance') || input.includes('patterns')) {
          return getResistanceExplanation(organism, 'clinician');
        } else if (input.includes('trends')) {
          return getTrendsExplanation('clinician');
        } else if (input.includes('local')) {
          return getLocalDataExplanation();
        }
        break;

      case 'public-health-intro':
        if (input.includes('trends')) {
          return getTrendsExplanation('public-health');
        } else if (input.includes('regional') || input.includes('comparisons')) {
          return getRegionalComparisonExplanation();
        } else if (input.includes('policy')) {
          return getPolicyExplanation();
        } else if (input.includes('hotspots')) {
          return getHotspotsExplanation();
        }
        break;

      case 'researcher-intro':
        if (input.includes('download') || input.includes('data')) {
          return getDataDownloadExplanation();
        } else if (input.includes('genotypes')) {
          return getGenotypesExplanation(organism);
        } else if (input.includes('research')) {
          return getResearchApplicationsExplanation();
        } else if (input.includes('educational')) {
          return getEducationalUseExplanation();
        }
        break;

      case 'general-intro':
        if (input.includes('what is amr') || input.includes('amr')) {
          return getAMRBasicsExplanation();
        } else if (input.includes('map')) {
          return getMapExplanation('general');
        } else if (input.includes('track') || input.includes('why')) {
          return getWhyTrackExplanation();
        } else if (input.includes('concepts')) {
          return getKeyConceptsExplanation();
        }
        break;

      default:
        return getHelpMessage();
    }

    // Default responses for common queries
    if (input.includes('help') || input.includes('stuck')) {
      return getHelpMessage();
    } else if (input.includes('example') || input.includes('show me')) {
      return getExampleExplanation(organism);
    } else if (input.includes('next') || input.includes('continue')) {
      return getNextStepsMessage(userProfile.type);
    }

    return {
      text: `I understand you're asking about "${userInput}". Let me help clarify that topic.

Could you be more specific about what you'd like to know?`,
      suggestions: [
        '🗺️ Map features',
        '📊 Data interpretation',
        '🔍 Search functions',
        '❓ General help'
      ]
    };
  };

  const getOrganismName = (organism) => {
    const names = {
      'styphi': 'Salmonella Typhi',
      'kpneumo': 'Klebsiella pneumoniae',
      'ngono': 'Neisseria gonorrhoeae',
      'ecoli': 'E. coli',
      'shigella': 'Shigella'
    };
    return names[organism] || 'this pathogen';
  };

  const getMapExplanation = (userType) => ({
    text: `🗺️ **The Interactive Map**

The world map shows resistance patterns by country:

🟢 **Green/Blue**: Low resistance (antibiotics work well)
🟡 **Yellow**: Moderate resistance
🔴 **Red**: High resistance (antibiotics less effective)
⚫ **Grey**: Not enough data (need ≥20 samples)

**Key tip**: Click on countries to see detailed data!

${userType === 'clinician' ? 'Use this to check resistance rates before prescribing antibiotics.' : ''}`,
    suggestions: [
      '🎛️ How to use filters',
      '📊 Understanding percentages',
      '🔍 Finding specific countries',
      '❓ Other questions'
    ]
  });

  const getResistanceExplanation = (organism, userType) => {
    const explanations = {
      'styphi': `🦠 **Salmonella Typhi Resistance**

Key patterns to watch:
• **MDR**: Resistant to 3+ antibiotics (ampicillin, chloramphenicol, trimethoprim-sulfamethoxazole)
• **XDR**: MDR + resistant to ciprofloxacin + ceftriaxone (very concerning!)
• **Ciprofloxacin resistance**: Reduces oral treatment options

${userType === 'clinician' ? '⚕️ Clinical tip: High XDR areas may need IV ceftriaxone or azithromycin' : ''}`,
      'kpneumo': `🦠 **Klebsiella pneumoniae Resistance**

Critical mechanisms:
• **ESBL**: Resistant to many beta-lactam antibiotics
• **Carbapenemase**: Resistant to carbapenems (last-resort drugs!)
• **Colistin resistance**: Resistant to the "antibiotic of last resort"

${userType === 'clinician' ? '⚕️ Clinical tip: Carbapenem resistance severely limits treatment options' : ''}`,
      'ngono': `🦠 **Neisseria gonorrhoeae Resistance**

Current concerns:
• **Azithromycin resistance**: Threatens dual therapy
• **Ceftriaxone resistance**: Eliminates current first-line treatment
• **XDR**: Resistant to multiple drug classes

${userType === 'clinician' ? '⚕️ Clinical tip: Follow local guidelines - resistance patterns change rapidly' : ''}`
    };

    return {
      text: explanations[organism] || `🦠 **Understanding Resistance Patterns**

Look for these key indicators:
• Individual antibiotic resistance rates
• Multi-drug resistance (MDR) patterns
• Extensively drug-resistant (XDR) strains
• Trend changes over time`,
      suggestions: [
        '📈 How to spot trends',
        '🌍 Regional differences',
        '⚠️ Warning signs',
        '💡 More examples'
      ]
    };
  };

  const getTrendsExplanation = (userType) => ({
    text: `📈 **Understanding Trends**

Time trend graphs show if resistance is:
📈 **Increasing**: Getting worse over time
📉 **Decreasing**: Improving (interventions working?)
➡️ **Stable**: Consistent rates

**What to look for**:
• Sudden spikes (outbreaks?)
• Gradual increases (resistance spreading)
• Seasonal patterns

${userType === 'public-health' ?
  '🏛️ **For surveillance**: Use trends to guide intervention priorities and resource allocation.' :
  userType === 'clinician' ?
  '⚕️ **For clinical use**: Anticipate future resistance patterns in your area.' :
  ''
}`,
    suggestions: [
      '📊 Interpreting graphs',
      '⚠️ What trends concern you?',
      '🎯 Setting up alerts',
      '❓ More questions'
    ]
  });

  const getAMRBasicsExplanation = () => ({
    text: `🦠 **What is Antimicrobial Resistance (AMR)?**

Think of bacteria as having "armor" against antibiotics:

🛡️ **Normal bacteria**: Antibiotics can kill them
⚔️ **Resistant bacteria**: Have developed armor to survive antibiotics

**Why does this happen?**
• Bacteria naturally evolve and adapt
• Overuse/misuse of antibiotics speeds this up
• Resistant bacteria survive and multiply

**Why should I care?**
• Common infections become harder to treat
• Longer hospital stays
• Higher medical costs
• Some infections become untreatable`,
    suggestions: [
      '🗺️ How AMRnet helps',
      '🌍 Global impact',
      '💡 Prevention tips',
      '❓ More questions'
    ]
  });

  const getHelpMessage = () => ({
    text: `🤖 **I'm here to help!**

You can ask me about:
• How to use the map and filters
• Understanding resistance patterns
• Interpreting data for your role
• Specific pathogens and their resistance
• Getting started with AMRnet

**Try asking**: "How do I find data for my country?" or "What does XDR mean?"`,
    suggestions: [
      '🗺️ Map tutorial',
      '📚 Basic concepts',
      '🔍 Finding data',
      '🆘 Reset conversation'
    ]
  });

  const handleSuggestionClick = (suggestion) => {
    const cleanSuggestion = suggestion.replace(/[🔥🎯📊🗺️👩‍⚕️🏛️🔬📚💊📈🌍📋⚠️💡🦠➡️📉🛡️⚔️🤖🆘]/g, '').trim();
    setInputValue(cleanSuggestion);
    handleSendMessage(cleanSuggestion);
  };

  const handleSendMessage = (messageText = inputValue) => {
    if (!messageText.trim()) return;

    addUserMessage(messageText);
    setInputValue('');

    // Get bot response
    const response = getResponseFlow(messageText, currentFlow);
    addBotMessage(response, 1500);
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentFlow('greeting');
    setUserProfile({});
    addBotMessage(getGreetingMessage(), 500);
  };

  const MessageBubble = ({ message }) => (
    <Fade in timeout={500}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        {message.type === 'bot' && (
          <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
            <BotIcon />
          </Avatar>
        )}

        <Box sx={{ maxWidth: '70%' }}>
          <Card
            sx={{
              bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
              color: message.type === 'user' ? 'white' : 'text.primary',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line',
                  '& strong': { fontWeight: 'bold' }
                }}
                dangerouslySetInnerHTML={{
                  __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }}
              />
            </CardContent>
          </Card>

          {message.suggestions && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {message.suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  clickable
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          )}
        </Box>

        {message.type === 'user' && (
          <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>
            <PersonIcon />
          </Avatar>
        )}
      </Box>
    </Fade>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            <BotIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            AMRnet Assistant
          </Typography>
          <Box>
            <IconButton onClick={handleReset} size="small" sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            💡 **Tip**: I can help you navigate AMRnet step-by-step. Just tell me what you'd like to learn!
          </Alert>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
              <BotIcon />
            </Avatar>
            <Card sx={{ bgcolor: 'grey.100' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2">
                  Assistant is typing...
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </DialogContent>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask me anything about AMRnet..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            size="small"
          />
          <Button
            variant="contained"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

// Chatbot floating button
export const ChatbotButton = ({ organism }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Zoom in timeout={300}>
        <Fab
          color="secondary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000,
          }}
          onClick={() => setOpen(true)}
        >
          <BotIcon />
        </Fab>
      </Zoom>

      <ChatbotTutorial
        organism={organism}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default ChatbotTutorial;
