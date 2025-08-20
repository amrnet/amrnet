import {
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    Help as HelpIcon,
    LocalHospital as HospitalIcon,
    Info as InfoIcon,
    Lightbulb as LightbulbIcon,
    Public as PublicIcon,
    QuestionAnswer as QuestionAnswerIcon,
    School as SchoolIcon,
    Science as ScienceIcon
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Tooltip,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const InteractiveTutorial = ({ organism, onClose, open }) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [userType, setUserType] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [progress, setProgress] = useState(0);

  // User type definitions
  const userTypes = [
    {
      id: 'clinician',
      title: t('tutorial.userTypes.clinician.title', 'Healthcare Professional'),
      description: t('tutorial.userTypes.clinician.description', 'Doctor, nurse, or clinical microbiologist'),
      icon: <HospitalIcon />,
      color: '#1976d2',
    },
    {
      id: 'public-health',
      title: t('tutorial.userTypes.publicHealth.title', 'Public Health Official'),
      description: t('tutorial.userTypes.publicHealth.description', 'Epidemiologist, policy maker, or surveillance coordinator'),
      icon: <PublicIcon />,
      color: '#388e3c',
    },
    {
      id: 'researcher',
      title: t('tutorial.userTypes.researcher.title', 'Researcher/Student'),
      description: t('tutorial.userTypes.researcher.description', 'Academic researcher, student, or educator'),
      icon: <ScienceIcon />,
      color: '#f57c00',
    },
    {
      id: 'general',
      title: t('tutorial.userTypes.general.title', 'General User'),
      description: t('tutorial.userTypes.general.description', 'Learning about antimicrobial resistance'),
      icon: <SchoolIcon />,
      color: '#7b1fa2',
    },
  ];

  // Tutorial steps based on user type and organism
  const getTutorialSteps = (userType, organism) => {
    const baseSteps = [
      {
        label: t('tutorial.steps.welcome.label', 'Welcome to AMRnet'),
        content: {
          title: t('tutorial.steps.welcome.title', 'Understanding AMRnet'),
          description: t('tutorial.steps.welcome.description', 'AMRnet is your window into global antimicrobial resistance patterns'),
          sections: [
            {
              title: t('tutorial.steps.welcome.whatIs.title', 'What is AMRnet?'),
              content: t('tutorial.steps.welcome.whatIs.content',
                'AMRnet visualizes antimicrobial resistance patterns in bacteria worldwide. Think of it as a "weather map" for antibiotic resistance.'),
            },
            {
              title: t('tutorial.steps.welcome.whyImportant.title', 'Why is this important?'),
              content: t('tutorial.steps.welcome.whyImportant.content',
                'Understanding resistance patterns helps healthcare providers choose effective treatments and public health officials track resistance trends.'),
            },
          ],
        },
      },
      {
        label: t('tutorial.steps.organism.label', `Understanding ${organism || 'Pathogens'}`),
        content: getOrganismContent(organism),
      },
      {
        label: t('tutorial.steps.navigation.label', 'Navigating the Dashboard'),
        content: {
          title: t('tutorial.steps.navigation.title', 'Dashboard Layout'),
          description: t('tutorial.steps.navigation.description', 'Learn how to use the interactive map and controls'),
          sections: [
            {
              title: t('tutorial.steps.navigation.map.title', 'The World Map'),
              content: t('tutorial.steps.navigation.map.content',
                'Countries are colored by resistance levels: Green = low resistance, Red = high resistance, Grey = insufficient data'),
              interactive: true,
              action: 'highlight-map',
            },
            {
              title: t('tutorial.steps.navigation.filters.title', 'Filter Panel (Left)'),
              content: t('tutorial.steps.navigation.filters.content',
                'Use filters to focus on specific time periods, regions, or bacterial strains'),
              interactive: true,
              action: 'highlight-filters',
            },
            {
              title: t('tutorial.steps.navigation.variables.title', 'Variable Selection (Right)'),
              content: t('tutorial.steps.navigation.variables.content',
                'Choose which resistance patterns or bacterial strains to display on the map'),
              interactive: true,
              action: 'highlight-variables',
            },
          ],
        },
      },
      {
        label: t('tutorial.steps.interpretation.label', 'Interpreting Data'),
        content: {
          title: t('tutorial.steps.interpretation.title', 'Understanding the Results'),
          description: t('tutorial.steps.interpretation.description', 'Learn how to read and interpret the visualizations'),
          sections: [
            {
              title: t('tutorial.steps.interpretation.colors.title', 'Color Coding'),
              content: t('tutorial.steps.interpretation.colors.content',
                'Darker colors indicate higher resistance rates. Always check the legend for exact percentages.'),
            },
            {
              title: t('tutorial.steps.interpretation.confidence.title', 'Data Confidence'),
              content: t('tutorial.steps.interpretation.confidence.content',
                'Countries with ≥20 samples are most reliable. Be cautious with smaller sample sizes.'),
            },
            {
              title: t('tutorial.steps.interpretation.trends.title', 'Time Trends'),
              content: t('tutorial.steps.interpretation.trends.content',
                'Use time series graphs to see if resistance is increasing, decreasing, or stable over time.'),
            },
          ],
        },
      },
    ];

    // Add user-type specific steps
    const userSpecificSteps = getUserSpecificSteps(userType, organism);

    return [...baseSteps, ...userSpecificSteps];
  };

  const getOrganismContent = (organism) => {
    const organismData = {
      'styphi': {
        title: 'Salmonella Typhi (Typhoid Fever)',
        clinicalContext: 'Causes typhoid fever, mainly in South Asia and Sub-Saharan Africa. Spread through contaminated food and water.',
        keyResistance: ['MDR (Multi-Drug Resistant)', 'XDR (Extensively Drug Resistant)', 'Ciprofloxacin resistance'],
        importantStrains: ['H58 lineage', 'H58 XDR variants'],
        treatment: 'First-line treatments include fluoroquinolones and cephalosporins',
      },
      'kpneumo': {
        title: 'Klebsiella pneumoniae',
        clinicalContext: 'Major cause of hospital-acquired infections including pneumonia and bloodstream infections.',
        keyResistance: ['ESBL (Extended-Spectrum Beta-Lactamases)', 'Carbapenemase production', 'Colistin resistance'],
        importantStrains: ['ST258 (epidemic clone)', 'ST11 (Asian epidemic clone)'],
        treatment: 'Carbapenems are last-resort antibiotics; resistance is extremely concerning',
      },
      'ngono': {
        title: 'Neisseria gonorrhoeae (Gonorrhea)',
        clinicalContext: 'Sexually transmitted infection with potential for serious complications if untreated.',
        keyResistance: ['Azithromycin resistance', 'Ceftriaxone resistance', 'Multi-drug resistance'],
        importantStrains: ['Various lineages tracked by NG-MAST'],
        treatment: 'Current dual therapy: ceftriaxone + azithromycin',
      },
      // Add more organisms as needed
    };

    const data = organismData[organism] || {
      title: 'Bacterial Pathogen',
      clinicalContext: 'Important disease-causing bacteria',
      keyResistance: ['Various resistance mechanisms'],
      importantStrains: ['Multiple circulating strains'],
      treatment: 'Treatment depends on susceptibility patterns',
    };

    return {
      title: data.title,
      description: 'Understanding this pathogen and its resistance patterns',
      sections: [
        {
          title: 'Clinical Context',
          content: data.clinicalContext,
        },
        {
          title: 'Key Resistance Patterns',
          content: data.keyResistance.join(', '),
        },
        {
          title: 'Important Strains',
          content: data.importantStrains.join(', '),
        },
        {
          title: 'Treatment Considerations',
          content: data.treatment,
        },
      ],
    };
  };

  const getUserSpecificSteps = (userType, organism) => {
    const steps = {
      'clinician': [
        {
          label: 'Clinical Applications',
          content: {
            title: 'Using AMRnet for Patient Care',
            description: 'How to apply resistance data to clinical decision-making',
            sections: [
              {
                title: 'Empirical Therapy Selection',
                content: 'Check local resistance rates before prescribing antibiotics',
              },
              {
                title: 'Treatment Optimization',
                content: 'Adjust therapy based on regional resistance patterns',
              },
              {
                title: 'Infection Control',
                content: 'Identify high-risk resistant strains for enhanced precautions',
              },
            ],
          },
        },
      ],
      'public-health': [
        {
          label: 'Surveillance Applications',
          content: {
            title: 'Public Health Surveillance',
            description: 'Using AMRnet for population-level monitoring',
            sections: [
              {
                title: 'Trend Monitoring',
                content: 'Track resistance emergence and spread over time',
              },
              {
                title: 'Policy Development',
                content: 'Use data to guide antibiotic stewardship programs',
              },
              {
                title: 'Resource Allocation',
                content: 'Prioritize surveillance and intervention efforts',
              },
            ],
          },
        },
      ],
      'researcher': [
        {
          label: 'Research Applications',
          content: {
            title: 'Research and Education',
            description: 'Using AMRnet for scientific investigation',
            sections: [
              {
                title: 'Hypothesis Generation',
                content: 'Identify patterns for detailed investigation',
              },
              {
                title: 'Data Analysis',
                content: 'Download data for statistical analysis',
              },
              {
                title: 'Education',
                content: 'Teach students about global AMR patterns',
              },
            ],
          },
        },
      ],
      'general': [
        {
          label: 'Learning More',
          content: {
            title: 'Understanding AMR',
            description: 'Building knowledge about antimicrobial resistance',
            sections: [
              {
                title: 'Global Patterns',
                content: 'Explore how resistance varies worldwide',
              },
              {
                title: 'Prevention',
                content: 'Learn how to prevent resistance development',
              },
              {
                title: 'Resources',
                content: 'Find additional educational materials',
              },
            ],
          },
        },
      ],
    };

    return steps[userType] || [];
  };

  const handleNext = () => {
    setCompletedSteps(prev => new Set(prev).add(activeStep));
    setActiveStep(prev => prev + 1);
    updateProgress();
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const updateProgress = () => {
    const steps = getTutorialSteps(userType, organism);
    setProgress(((activeStep + 1) / steps.length) * 100);
  };

  const QuickStartGuide = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <LightbulbIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Quick Start Tips
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Start with your region of interest"
              secondary="Use the map to focus on your geographic area"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Check sample sizes"
              secondary="Countries with ≥20 samples provide more reliable data"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Look for trends over time"
              secondary="Use the time filter to see how resistance is changing"
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );

  const InteractiveQuiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    const questions = [
      {
        question: "What does a red-colored country on the map indicate?",
        options: [
          "No data available",
          "Low resistance rates",
          "High resistance rates",
          "Good healthcare system"
        ],
        correct: 2,
        explanation: "Red colors indicate high resistance rates, meaning antibiotics are less effective in that region."
      },
      {
        question: "What is the minimum sample size for reliable country data?",
        options: ["5 samples", "10 samples", "20 samples", "50 samples"],
        correct: 2,
        explanation: "Countries need at least 20 samples for AMRnet to display resistance data."
      },
      {
        question: "What does MDR stand for?",
        options: [
          "Major Drug Resistance",
          "Multi-Drug Resistant",
          "Molecular Drug Response",
          "Medical Data Repository"
        ],
        correct: 1,
        explanation: "MDR stands for Multi-Drug Resistant, meaning the bacteria is resistant to multiple antibiotics."
      }
    ];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Quick Knowledge Check
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(currentQuestion / questions.length) * 100}
          sx={{ mb: 2 }}
        />
        {/* Quiz implementation would go here */}
      </Box>
    );
  };

  const steps = getTutorialSteps(userType, organism);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">
            <QuestionAnswerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Interactive AMRnet Tutorial
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
      </DialogTitle>

      <DialogContent>
        {!userType ? (
          // User type selection
          <Box>
            <Typography variant="h6" gutterBottom>
              Tell us about yourself to customize your tutorial:
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
              {userTypes.map((type) => (
                <Card
                  key={type.id}
                  sx={{
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: type.color,
                      boxShadow: 2,
                    }
                  }}
                  onClick={() => setUserType(type.id)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box sx={{ color: type.color, mr: 1 }}>
                        {type.icon}
                      </Box>
                      <Typography variant="h6">
                        {type.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ) : (
          // Tutorial content
          <Box>
            <QuickStartGuide />

            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {step.content.title}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {step.content.description}
                        </Typography>

                        {step.content.sections.map((section, sectionIndex) => (
                          <Accordion key={sectionIndex} defaultExpanded={sectionIndex === 0}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle1">
                                {section.title}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="body2">
                                {section.content}
                              </Typography>
                              {section.interactive && (
                                <Alert severity="info" sx={{ mt: 1 }}>
                                  <InfoIcon sx={{ mr: 1 }} />
                                  Try interacting with this feature on the main dashboard!
                                </Alert>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </CardContent>
                    </Card>

                    <Box sx={{ mb: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                        disabled={index === steps.length - 1}
                      >
                        {index === steps.length - 1 ? 'Finish' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {activeStep === steps.length && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🎉 Congratulations!
                  </Typography>
                  <Typography variant="body1" paragraph>
                    You've completed the AMRnet tutorial. You're now ready to explore antimicrobial resistance data!
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => setShowQuiz(true)}
                    sx={{ mr: 1 }}
                  >
                    Take Quick Quiz
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={onClose}
                  >
                    Start Exploring
                  </Button>
                </CardContent>
              </Card>
            )}

            {showQuiz && (
              <Dialog open={showQuiz} onClose={() => setShowQuiz(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Knowledge Check</DialogTitle>
                <DialogContent>
                  <InteractiveQuiz />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowQuiz(false)}>Close</Button>
                </DialogActions>
              </Dialog>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setUserType(null)} disabled={!userType}>
          Change User Type
        </Button>
        <Button onClick={onClose}>
          Close Tutorial
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Floating tutorial button component
export const TutorialButton = ({ organism }) => {
  const [open, setOpen] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial for this organism
    const seen = localStorage.getItem(`tutorial-seen-${organism}`);
    setHasSeenTutorial(!!seen);
  }, [organism]);

  const handleOpen = () => {
    setOpen(true);
    localStorage.setItem(`tutorial-seen-${organism}`, 'true');
    setHasSeenTutorial(true);
  };

  return (
    <>
      <Tooltip title="Interactive Tutorial" placement="left">
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={handleOpen}
        >
          <Badge variant="dot" color="error" invisible={hasSeenTutorial}>
            <HelpIcon />
          </Badge>
        </Fab>
      </Tooltip>

      <InteractiveTutorial
        organism={organism}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default InteractiveTutorial;
