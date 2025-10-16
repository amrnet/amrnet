# AMRnet Tutorial Integration Guide

## Overview

This guide explains how to integrate the new tutorial components into the AMRnet dashboard to help users without deep biology or epidemiology knowledge effectively use the platform.

## Components Created

### 1. Comprehensive Documentation (`docs/tutorial.rst`)

- **Purpose**: Academic-quality, comprehensive user guide for Read the Docs
- **Audience**: All user types, especially those needing in-depth reference material
- **Content**: 400+ section tutorial covering everything from basic concepts to advanced features
- **Based on**: TyphiNET methodology and best practices from the cited manuscript

### 2. Interactive Tutorial Component (`client/src/components/Tutorial/InteractiveTutorial.js`)

- **Purpose**: Step-by-step guided tutorial within the dashboard
- **Audience**: Users who prefer structured, interactive learning
- **Features**:
  - User type selection (clinician, public health, researcher, general)
  - Organism-specific content
  - Progress tracking
  - Interactive quiz
  - Contextual help

### 3. Chatbot Tutorial (`client/src/components/Tutorial/ChatbotTutorial.js`)

- **Purpose**: Conversational, AI-assistant style help
- **Audience**: Users who prefer asking questions naturally
- **Features**:
  - Natural language interaction
  - Context-aware responses
  - Quick suggestions
  - User type personalization
  - Organism-specific guidance

## Implementation Steps

### Step 1: Add Tutorial Components to Dashboard

```javascript
// In your main dashboard component (e.g., Dashboard.js)
import { TutorialButton, ChatbotButton } from '../components/Tutorial';

function Dashboard({ organism }) {
  return (
    <div>
      {/* Your existing dashboard content */}

      {/* Add floating tutorial buttons */}
      <TutorialButton organism={organism} />
      <ChatbotButton organism={organism} />
    </div>
  );
}
```

### Step 2: Add to Navigation Menu

```javascript
// In your navigation component
import { useState } from 'react';
import { InteractiveTutorial } from '../components/Tutorial';

function Navigation() {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <nav>
      <button onClick={() => setTutorialOpen(true)}>
        Tutorial
      </button>

      <InteractiveTutorial
        open={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        organism={currentOrganism}
      />
    </nav>
  );
}
```

### Step 3: First-Time User Experience

```javascript
// Detect first-time users and show tutorial
import { useEffect, useState } from 'react';

function App() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('amrnet-visited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('amrnet-visited', 'true');
    }
  }, []);

  return (
    <div>
      <InteractiveTutorial
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
      {/* Rest of app */}
    </div>
  );
}
```

### Step 4: Context-Sensitive Help

```javascript
// Add help buttons to specific dashboard sections
function MapComponent() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div>
      <div className="map-header">
        <h2>Resistance Map</h2>
        <IconButton onClick={() => setHelpOpen(true)}>
          <HelpIcon />
        </IconButton>
      </div>

      {/* Map content */}

      <ChatbotTutorial
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        initialTopic="map-usage"
      />
    </div>
  );
}
```

## User Type Customization

The tutorial system adapts content based on user type:

### Healthcare Professionals
- Focus on clinical decision-making
- Treatment selection guidance
- Local resistance rates
- Infection control implications

### Public Health Officials
- Surveillance applications
- Trend monitoring
- Policy development
- Resource allocation

### Researchers/Students
- Data download options
- Research methodologies
- Educational applications
- Hypothesis generation

### General Users
- Basic AMR concepts
- Simple explanations
- Why resistance matters
- Prevention strategies

## Organism-Specific Content

Content adapts based on the selected pathogen:

```javascript
// Example organism-specific content structure
const organismContent = {
  'styphi': {
    clinicalContext: 'Typhoid fever, endemic in South Asia...',
    keyResistance: ['MDR', 'XDR', 'Ciprofloxacin NS'],
    treatmentGuidance: 'Consider azithromycin for XDR...',
  },
  'kpneumo': {
    clinicalContext: 'Hospital-acquired infections...',
    keyResistance: ['ESBL', 'Carbapenemase', 'Colistin'],
    treatmentGuidance: 'Carbapenem resistance limits options...',
  },
  // Add more organisms
};
```

## Internationalization Support

Tutorial components use react-i18next for multi-language support:

```javascript
// Tutorial translations are already added to locales/en.json
// Add translations for other languages in respective locale files

// Spanish (locales/es.json)
{
  "tutorial": {
    "userTypes": {
      "clinician": {
        "title": "Profesional de la Salud",
        "description": "Médico, enfermera o microbiólogo clínico"
      }
      // ... more translations
    }
  }
}
```

## Analytics and Tracking

Track tutorial usage to improve content:

```javascript
// Add analytics to tutorial interactions
import { trackEvent } from '../analytics';

function InteractiveTutorial({ organism }) {
  const handleStepComplete = (stepIndex) => {
    trackEvent('tutorial_step_completed', {
      organism,
      step: stepIndex,
      userType
    });
  };

  const handleTutorialComplete = () => {
    trackEvent('tutorial_completed', {
      organism,
      userType,
      duration: Date.now() - startTime
    });
  };
}
```

## Performance Considerations

### Lazy Loading
```javascript
// Lazy load tutorial components to reduce initial bundle size
import { lazy, Suspense } from 'react';

const InteractiveTutorial = lazy(() =>
  import('../components/Tutorial/InteractiveTutorial')
);

function Dashboard() {
  return (
    <Suspense fallback={<div>Loading tutorial...</div>}>
      <InteractiveTutorial />
    </Suspense>
  );
}
```

### Caching
```javascript
// Cache tutorial progress in localStorage
const saveTutorialProgress = (progress) => {
  localStorage.setItem('tutorial-progress', JSON.stringify(progress));
};

const loadTutorialProgress = () => {
  const saved = localStorage.getItem('tutorial-progress');
  return saved ? JSON.parse(saved) : {};
};
```

## Accessibility Features

### Screen Reader Support
```javascript
// Tutorial components include ARIA labels and descriptions
<Dialog
  aria-labelledby="tutorial-title"
  aria-describedby="tutorial-description"
>
  <DialogTitle id="tutorial-title">
    AMRnet Tutorial
  </DialogTitle>
  <DialogContent id="tutorial-description">
    {/* Tutorial content */}
  </DialogContent>
</Dialog>
```

### Keyboard Navigation
```javascript
// Handle keyboard shortcuts for tutorial navigation
useEffect(() => {
  const handleKeyPress = (event) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === 'ArrowLeft') {
      handleBack();
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, []);
```

## Testing Strategy

### Unit Tests
```javascript
// Test tutorial component functionality
import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveTutorial from './InteractiveTutorial';

test('displays user type selection on first load', () => {
  render(<InteractiveTutorial open={true} />);
  expect(screen.getByText('Healthcare Professional')).toBeInTheDocument();
});

test('progresses through steps correctly', () => {
  render(<InteractiveTutorial open={true} />);
  fireEvent.click(screen.getByText('Healthcare Professional'));
  fireEvent.click(screen.getByText('Continue'));
  expect(screen.getByText('Understanding Pathogens')).toBeInTheDocument();
});
```

### Integration Tests
```javascript
// Test tutorial integration with main dashboard
test('tutorial button opens tutorial dialog', () => {
  render(<Dashboard />);
  fireEvent.click(screen.getByLabelText('Interactive Tutorial'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

### User Acceptance Testing
- Test with representatives from each user type
- Gather feedback on content clarity and usefulness
- Monitor completion rates and drop-off points
- A/B test different tutorial approaches

## Content Updates

### Regular Review Process
1. **Quarterly content review**: Update based on user feedback
2. **Annual major updates**: Align with new features and data
3. **Organism additions**: Add content for new pathogens
4. **Translation updates**: Keep all languages synchronized

### Content Management
```javascript
// Centralize tutorial content for easy updates
const tutorialContent = {
  version: '1.0',
  lastUpdated: '2024-08-04',
  organisms: {
    styphi: { /* content */ },
    kpneumo: { /* content */ },
  },
  userTypes: {
    clinician: { /* content */ },
    publicHealth: { /* content */ },
  }
};
```

## Deployment Checklist

- [ ] Tutorial components integrated into dashboard
- [ ] Translation files updated for all supported languages
- [ ] Analytics tracking implemented
- [ ] Accessibility features tested
- [ ] Performance optimization completed
- [ ] User acceptance testing conducted
- [ ] Documentation updated
- [ ] Tutorial content reviewed by domain experts

## Future Enhancements

### Video Tutorials
```javascript
// Add video content support
const VideoTutorial = ({ videoId, organism }) => (
  <iframe
    src={`https://www.youtube.com/embed/${videoId}`}
    title={`${organism} Tutorial`}
    allowFullScreen
  />
);
```

### Interactive Tours
```javascript
// Implement dashboard highlighting during tutorials
import { driver } from 'driver.js';

const startInteractiveTour = () => {
  const driverObj = driver({
    showProgress: true,
    steps: [
      {
        element: '#map-container',
        popover: {
          title: 'World Map',
          description: 'This shows resistance patterns by country'
        }
      },
      // More tour steps
    ]
  });

  driverObj.drive();
};
```

### AI-Powered Help
```javascript
// Future: Integrate with AI services for more natural conversations
const aiChatbot = async (userMessage) => {
  const response = await fetch('/api/ai-help', {
    method: 'POST',
    body: JSON.stringify({ message: userMessage, context: organism })
  });
  return response.json();
};
```

## Support and Maintenance

### User Feedback Collection
```javascript
// Add feedback collection to tutorial components
const FeedbackForm = ({ onSubmit }) => (
  <form onSubmit={onSubmit}>
    <TextField
      label="How helpful was this tutorial?"
      multiline
      rows={3}
    />
    <Rating
      name="tutorial-rating"
      precision={0.5}
    />
    <Button type="submit">Submit Feedback</Button>
  </form>
);
```

### Help Documentation
- Maintain developer documentation for tutorial system
- Create user guides for different audiences
- Keep troubleshooting guides updated
- Document common user questions and answers

This comprehensive tutorial system makes AMRnet accessible to users regardless of their technical background while maintaining the scientific rigor and academic quality expected in healthcare and research settings.
