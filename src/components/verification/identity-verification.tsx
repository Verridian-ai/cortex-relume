import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Camera, 
  FileText, 
  User, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Eye,
  Info
} from 'lucide-react';
import { identityVerificationService } from '@/lib/verification/identity-verification';
import { IdentityVerification, VerificationResult } from '@/lib/verification/verification-status';

interface IdentityVerificationProps {
  userId: string;
  onSuccess: (verification: IdentityVerification) => void;
  onError: (error: string) => void;
  onBack?: () => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  type: 'front' | 'back' | 'selfie';
}

export const IdentityVerificationComponent: React.FC<IdentityVerificationProps> = ({
  userId,
  onSuccess,
  onError,
  onBack
}) => {
  const [verification, setVerification] = useState<IdentityVerification | null>(null);
  const [step, setStep] = useState<'personal' | 'documents' | 'submit' | 'review'>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Personal information
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });

  // Document upload
  const [documentType, setDocumentType] = useState<'passport' | 'drivers_license' | 'national_id'>('passport');
  const [uploadedFiles, setUploadedFiles] = useState<{
    front?: UploadedFile;
    back?: UploadedFile;
    selfie?: UploadedFile;
  }>({});
  const [dragActive, setDragActive] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const nationalities = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 
    'Spain', 'Italy', 'Japan', 'South Korea', 'China', 'India', 'Brazil'
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 
    'Spain', 'Italy', 'Japan', 'South Korea', 'China', 'India', 'Brazil', 'Mexico'
  ];

  const handlePersonalInfoChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '');
      setPersonalInfo(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setPersonalInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setError('');
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File, type: 'front' | 'back' | 'selfie') => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setIsLoading(true);
    try {
      const preview = await createPreview(file);
      const uploadedFile: UploadedFile = {
        file,
        preview,
        type
      };

      setUploadedFiles(prev => ({
        ...prev,
        [type]: uploadedFile
      }));

      // Update progress
      const totalFiles = documentType === 'passport' ? 2 : 3; // Passport doesn't need back
      const uploadedCount = Object.keys({ ...uploadedFiles, [type]: uploadedFile }).length;
      setProgress((uploadedCount / totalFiles) * 100);

    } catch (err) {
      setError('Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'front' | 'back' | 'selfie') => {
    e.preventDefault();
    setDragActive(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileUpload(files[0], type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.currentTarget.id);
  };

  const removeFile = (type: 'front' | 'back' | 'selfie') => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[type];
      return newFiles;
    });

    // Update progress
    const totalFiles = documentType === 'passport' ? 2 : 3;
    const uploadedCount = Object.keys(uploadedFiles).length - 1;
    setProgress((uploadedCount / totalFiles) * 100);
  };

  const validatePersonalInfo = () => {
    if (!personalInfo.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!personalInfo.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!personalInfo.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    if (!personalInfo.nationality) {
      setError('Nationality is required');
      return false;
    }
    if (!personalInfo.address.street.trim() || !personalInfo.address.city.trim()) {
      setError('Complete address is required');
      return false;
    }

    // Validate age (must be 18+)
    const birthDate = new Date(personalInfo.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setError('You must be at least 18 years old');
      return false;
    }

    return true;
  };

  const validateDocuments = () => {
    const requiredFiles = documentType === 'passport' ? ['front', 'selfie'] : ['front', 'back', 'selfie'];
    const missingFiles = requiredFiles.filter(type => !uploadedFiles[type as keyof typeof uploadedFiles]);
    
    if (missingFiles.length > 0) {
      setError(`Please upload: ${missingFiles.join(', ')} image(s)`);
      return false;
    }

    return true;
  };

  const handleCreateVerification = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await identityVerificationService.createVerification(userId);
      
      if (result.success && result.verification) {
        setVerification(result.verification);
        setStep('documents');
      } else {
        setError(result.error?.message || 'Failed to create verification');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocuments = async () => {
    if (!verification) return;
    if (!validateDocuments()) return;

    setIsLoading(true);
    setError('');

    try {
      const frontFile = uploadedFiles.front?.file;
      const backFile = uploadedFiles.back?.file;
      const selfieFile = uploadedFiles.selfie?.file;

      if (!frontFile || !selfieFile) {
        setError('Front image and selfie are required');
        return;
      }

      const result = await identityVerificationService.uploadDocument({
        verificationId: verification.id,
        documentType,
        frontImage: frontFile,
        backImage: backFile,
        selfieImage: selfieFile
      });

      if (result.success && result.verification) {
        setVerification(result.verification);
        if (result.verification.isVerified) {
          onSuccess(result.verification);
        } else {
          setStep('review');
        }
      } else {
        setError(result.error?.message || 'Failed to upload documents');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPersonalInfo = async () => {
    if (!verification) return;
    if (!validatePersonalInfo()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await identityVerificationService.submitIdentityInfo({
        verificationId: verification.id,
        ...personalInfo
      });

      if (result.success && result.verification) {
        setVerification(result.verification);
        setStep('documents');
      } else {
        setError(result.error?.message || 'Failed to submit personal information');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={personalInfo.firstName}
              onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={personalInfo.lastName}
              onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={personalInfo.dateOfBirth}
            onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality *</Label>
          <Select value={personalInfo.nationality} onValueChange={(value) => handlePersonalInfoChange('nationality', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              {nationalities.map((nationality) => (
                <SelectItem key={nationality} value={nationality}>
                  {nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Address *</h4>
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={personalInfo.address.street}
              onChange={(e) => handlePersonalInfoChange('address.street', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={personalInfo.address.city}
                onChange={(e) => handlePersonalInfoChange('address.city', e.target.value)}
                placeholder="New York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={personalInfo.address.state}
                onChange={(e) => handlePersonalInfoChange('address.state', e.target.value)}
                placeholder="NY"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={personalInfo.address.postalCode}
                onChange={(e) => handlePersonalInfoChange('address.postalCode', e.target.value)}
                placeholder="10001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={personalInfo.address.country} onValueChange={(value) => handlePersonalInfoChange('address.country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        <Button
          onClick={verification ? handleSubmitPersonalInfo : handleCreateVerification}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              {verification ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>
              {verification ? 'Continue' : 'Start Verification'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderDocumentUploadStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Document Type *</Label>
          <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="drivers_license">Driver's License</SelectItem>
              <SelectItem value="national_id">National ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload Areas */}
        <div className="space-y-4">
          {/* Front Image */}
          <div className="space-y-2">
            <Label>Front of Document *</Label>
            <div
              id="front-drop"
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive === 'front-drop' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDrop={(e) => handleDrop(e, 'front')}
              onDragOver={handleDragOver}
            >
              {uploadedFiles.front ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={uploadedFiles.front.preview}
                      alt="Front document"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{uploadedFiles.front.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFiles.front.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('front')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    Drag & drop or click to upload
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => frontInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'front')}
                className="hidden"
              />
            </div>
          </div>

          {/* Back Image (if not passport) */}
          {documentType !== 'passport' && (
            <div className="space-y-2">
              <Label>Back of Document *</Label>
              <div
                id="back-drop"
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive === 'back-drop' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDrop={(e) => handleDrop(e, 'back')}
                onDragOver={handleDragOver}
              >
                {uploadedFiles.back ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={uploadedFiles.back.preview}
                        alt="Back document"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{uploadedFiles.back.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFiles.back.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile('back')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Drag & drop or click to upload
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => backInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'back')}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Selfie */}
          <div className="space-y-2">
            <Label>Selfie Photo *</Label>
            <div
              id="selfie-drop"
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive === 'selfie-drop' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDrop={(e) => handleDrop(e, 'selfie')}
              onDragOver={handleDragOver}
            >
              {uploadedFiles.selfie ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={uploadedFiles.selfie.preview}
                      alt="Selfie"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{uploadedFiles.selfie.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFiles.selfie.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('selfie')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    Take a selfie holding your ID
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selfieInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Progress */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Upload Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Upload Guidelines */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Photo Guidelines:</p>
              <ul className="space-y-1">
                <li>• Documents must be clearly visible and readable</li>
                <li>• Selfie should show your face clearly while holding the ID</li>
                <li>• All text must be in focus and not blurry</li>
                <li>• No glare or shadows on documents</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setStep('personal')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={handleUploadDocuments}
          disabled={isLoading || progress < 100}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              Upload Documents
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto">
        <FileText className="w-8 h-8 text-white" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Under Review
        </h3>
        <p className="text-gray-600">
          Your identity verification is being reviewed by our team. This usually takes 1-2 business days.
        </p>
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          We'll notify you via email once the review is complete.
        </p>
      </div>

      <Button
        onClick={() => onSuccess(verification!)}
        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
      >
        Continue
      </Button>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Verify Your Identity
            </h2>
            <p className="text-gray-600">
              Complete identity verification to access premium features
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {['personal', 'documents', 'review'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName 
                    ? 'bg-blue-500 text-white'
                    : (step === 'review' && index < 2) || (step === 'documents' && index === 0)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step === 'review' || (step === 'documents' && index === 0)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          {step === 'personal' && renderPersonalInfoStep()}
          {step === 'documents' && renderDocumentUploadStep()}
          {step === 'review' && renderReviewStep()}
        </Card>
      </motion.div>
    </div>
  );
};

export default IdentityVerificationComponent;
